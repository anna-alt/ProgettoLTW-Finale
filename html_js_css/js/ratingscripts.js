Vue.component('star-rating', {

  props: {
    'value': null,
  },

  template: '<div class="star-rating">\
        <label class="star-rating__star" v-for="rating in ratings" \
        :class="{\'is-selected\': ((value >= rating) && value != null)}" \
        v-on:click="set(rating)" v-on:mouseover="star_over(rating)" v-on:mouseout="star_out">\
        <input class="star-rating star-rating__checkbox" type="radio" :value="rating" \
        v-model="value" v-bind:value="value">★</label></div>',

  /*    
   * initial state
   */
  data: function () {
    return {
      temp_value: null,
      ratings: [1, 2, 3, 4, 5],
    };
  },

  methods: {
    /*
     * mouseover
     */
    star_over: function (index) {
        this.temp_value = this.value;
        return this.value = index;
    },

    /*
     * mouseout
     */
    star_out: function () {
      return this.value = this.temp_value;
      
    },

    /*
     * set rating
     */
    set: function (value) {
      this.temp_value = value;
      $("#numrate").html(value);
      return this.value = value;
      
    }
  }


  
});

new Vue({
  el: '#app',

});