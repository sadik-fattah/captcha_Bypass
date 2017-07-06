function ff_extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

function isScrolledIntoView(elem)
{
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}


var sid = setInterval(function () {
	if (window.location.href.match(/https:\/\/www.google.com\/recaptcha\/api\d\/anchor/) && $("#recaptcha-anchor div.recaptcha-checkbox-checkmark").length
			&& $("#recaptcha-anchor div.recaptcha-checkbox-checkmark").is(':visible')  && isScrolledIntoView($("#recaptcha-anchor div.recaptcha-checkbox-checkmark").get(0)))
		{
			var execute = true;

			if (sessionStorage.getItem('accesstime'))
				{
					if (new Date().getTime() - sessionStorage.getItem('accesstime') < 2000)
						{
							execute = false;
						}
				}

			if (execute)
				{
					$("#recaptcha-anchor div.recaptcha-checkbox-checkmark").click();                    
					sessionStorage.setItem('accesstime', new Date().getTime());
				}
				clearInterval(sid);

		}
}, 120);