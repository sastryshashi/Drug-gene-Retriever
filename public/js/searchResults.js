function highlightText() {
  $('.abstractText').each (function() {
    $this = $(this).text().split(' ');
    var str = '';
    $this.forEach(function(value) {
        if (value == "Abraxane") {
          console.log(value)
          str = str + " <span class=tempClass>" + value + "</span>";
        }
        else
          str = str + " " + value;
    })
    $(this).html(str);
  });
}

$(document).ready (highlightText);
