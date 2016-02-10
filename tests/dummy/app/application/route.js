import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel() {
    this.router.on('didTransition', () => {
      window.scrollTo(0,0);
    });
  }
});

