'use strict';

document.getElementById('jump').addEventListener('change', function() {
  window.location.hash = this.value;
});
