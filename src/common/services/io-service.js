
import loggable from 'common/logger/mixins/loggable';
import isPublic from 'common/actors/decorators/public';
import SocketIOBus from 'mesh-socket-io-bus';
import { Service } from 'common/services';
import { ParallelBus } from 'mesh';
import document from 'common/actors/decorators/document';

@loggable
export default class IOService extends Service {

  load() {

    // this is the public service which handles all
    // incomming actions
    this.publicService = Service.create({
      target: {}
    });

    // scan the application for all public actions and add
    // then to the public service
    for (const actor of this.app.actors) {
      for (const actionType of (actor.__publicProperties || [])) {
        this.logger.info(`exposing ${actor.constructor.name}.${actionType}`);
        this.publicService.setActor(actionType, actor);
      }
    }

    // remote actors which take actions from the server
    this._remoteActors = [];

    // the remote bus which redirecs actions to the remote actors
    this.remoteBus = ParallelBus.create(this._remoteActors);

    // add the remote actors to the application so that they
    // receive actions from other parts of the application
    this.app.actors.push(this.remoteBus);
  }

  /**
   * returns the publicly accessible actors
   */

  @isPublic
  @document('returns the public action types')
  getPublicActionTypes() {
    return Object.keys(this.publicService.target);
  }

  /**
   */

  @isPublic
  @document('pings remote connections')
  ping() {
    return 'pong';
  }

  /**
   */

  @document('returns the number of remote connections')
  getRemoteConnectionCount() {
    return this._remoteActors.length;
  }

  /**
   */

  addConnection = async (connection) => {
    this.logger.info('client connected');

    var remoteService = Service.create({
      target: {}
    });

    // from here on, all global actions will touch on this remote service object.
    // If the action is registered to the service, that action will be executed
    // against the remote client.
    this._remoteActors.push(remoteService);

    // setup the bus which will facilitate in all
    // transactions between the remote service
    var remoteBus = SocketIOBus.create({
      client: connection
    }, this.publicService);

    // fetch the remote action types, and set them to the remote service
    // so that we limit the number of outbound actions
    for (const remoteActionType of await remoteBus.execute({ type: 'getPublicActionTypes' }).readAll()) {
      this.logger.verbose('adding remote action "%s"', remoteActionType);
      remoteService.setActor(remoteActionType, remoteBus);
    }


    connection.once('disconnect', () => {
      this.logger.info('client disconnected');

      this._remoteActors.splice(
        this._remoteActors.indexOf(remoteService),
        1
      );
    });
  }

  _logNumConnections() {
    this.logger.verbose('connection count: %d', this._remoteActors.length);
  }
}