
function pop_init(my_content) {
	//pop_html2, pop-wrap2, pop-content2 e pop_height2 servono per rendere il popup responsive.
	var pop_html = '<div class="pop-bg"></div><div class="pop-wrap"><p class="pop-x">X</p><div class="pop-content"></div></div>';
	var pop_html2 = '<div class="pop-bg"></div><div class="pop-wrap2"><p class="pop-x">X</p><div class="pop-content2"></div></div>';
	if(innerWidth < 1200){
		$("body").prepend(pop_html2);
	}else{
		$("body").prepend(pop_html);
	}
	var pop_height = "20%";
	var pop_height2 = "60%";

	$(".pop-wrap2 ,.pop-wrap").animate({ "height" : pop_height },250).click(function (event) {
		event.stopPropagation();
	});
	$(".pop-wrap2").animate({ "height" : pop_height2 },200).click(function (event) {
		event.stopPropagation();
	});

	$(".pop-content2, .pop-content").text(my_content);


	$(".pop-x").bind("click", function () {
		pop_close();
	});

	



}

function pop_close() {
	$(".pop-bg, .pop-wrap ,.pop-wrap2").remove();
	$("body").unbind("click");

}



	$(".popup-me").click(function () {

		pop_init("Don't know what to watch? We'll help you! Choose the genre you'd like or the mood you're feeling and play the slot. You'll get the perfect film for you! And don't forget to register to save all the movies you'd like to watch!");

	});


