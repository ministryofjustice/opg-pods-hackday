module.exports = function(env) {
  /**
   * Instantiate object used to store the methods registered as a
   * 'filter' (of the same name) within nunjucks. You can override
   * gov.uk core filters by creating filter methods of the same name.
   * @type {Object}
   */
  var filters = {}

  /* ------------------------------------------------------------------
    add your methods to the filters obj below this comment block:
    @example:

    filters.sayHi = function(name) {
        return 'Hi ' + name + '!'
    }

    Which in your templates would be used as:

    {{ 'Paul' | sayHi }} => 'Hi Paul'

    Notice the first argument of your filters method is whatever
    gets 'piped' via '|' to the filter.

    Filters can take additional arguments, for example:

    filters.sayHi = function(name,tone) {
      return (tone == 'formal' ? 'Greetings' : 'Hi') + ' ' + name + '!'
    }

    Which would be used like this:

    {{ 'Joel' | sayHi('formal') }} => 'Greetings Joel!'
    {{ 'Gemma' | sayHi }} => 'Hi Gemma!'

    For more on filters and how to write them see the Nunjucks
    documentation.

  ------------------------------------------------------------------ */

  filters.todayPlus14Days = () => {
      const date = new Date();
      date.setDate(date.getDate() + 14);

      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  filters.todayPlus21Days = () => {
      const date = new Date();
      date.setDate(date.getDate() + 21);

      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  filters.getDate = (x) => {
      const date = new Date();
      date.setDate(date.getDate() + x);

      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  filters.getTime = (x) => {
      const time = new Date();
      const hours = time.getHours();
      const mins = time.getMinutes();

      return `${hours}:${mins}`;
  };

  filters.merge = (a, b) => {
      return a.concat(b);
  };

  filters.randomNumber = (from, to) => {
      return Math.floor(Math.random() * (to - from)) + from;
  };

  filters.toMonth = function(x) {
      months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      if (x > 0) {
          return months[x - 1]; // returns date as per month
      } else {
          return x;
      }
  }

  filters.formatAddress = (lines) => `<div>${lines.join('<div></div>')}</div>`;

  filters.you = (data) => data['who-for'] === 'someone-else' ? (data.lpa.donor.firstname || 'donor') : 'you' ;
  filters.your = (data, anon) => data['who-for'] === 'someone-else' ? (anon ? 'their' : `${data.lpa.donor.firstname || 'donor'}'s`) : 'your';
  filters.your2 = (data) => data['who-for'] === 'someone-else' ? 'their' : 'your';
  filters.do = (data) => data['who-for'] === 'someone-else' ? 'does' : 'do';
  filters.i = (data) => data['who-for'] === 'someone-else' ? (data.lpa.donor.firstname || 'the donor') : 'I';
  filters.have = (data) => data['who-for'] === 'someone-else' ? 'has' : 'have';
  filters.my = (data) => data['who-for'] === 'someone-else' ? `${data.lpa.donor.fullname || 'the donor'}'s` : 'my';
  filters.are = (data) => data['who-for'] === 'someone-else' ? 'is' : 'are';
  filters.want = (data) => data['who-for'] === 'someone-else' ? 'wants' : 'want';
  filters.add = (data) => data['who-for'] === 'someone-else' ? 'adds' : 'add';
  filters.understand = (data) => data['who-for'] === 'someone-else' ? 'understands' : 'understand';
  filters.get = (data) => data['who-for'] === 'someone-else' ? 'gets' : 'get';
  filters.lose = (data) => data['who-for'] === 'someone-else' ? 'loses' : 'lose';
  filters.give = (data) => data['who-for'] === 'someone-else' ? 'gives' : 'give';
  filters.find = (data) => data['who-for'] === 'someone-else' ? 'finds' : 'find';
  filters.was = (data) => data['who-for'] === 'someone-else' ? 'was' : 'were';
  filters.yourself = (data) => data['who-for'] === 'someone-else' ? (data.lpa.donor.fullname || 'donor') : 'yourself' ;




  /* ------------------------------------------------------------------
    keep the following line to return your filters to the app
  ------------------------------------------------------------------ */
  return filters
}
