function highlightText() {
  $('.abstractText').each (function() {
    $this = $(this).text().split(' ');
    var str = '';
    $this.forEach(function(value) {
        if (value == "CYP2B1") {
          console.log(value)
          str = str + " <span class=tempClass>" + value + "</span>";
        } else if (value == 'Abraxane') {
          str = str + " <span class=tempClass2>" + value + "</span>";
        }
        else
          str = str + " " + value;
    })
    $(this).html(str);
  });
}

$(document).ready (highlightText);
