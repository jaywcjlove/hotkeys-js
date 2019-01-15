;(function($){

    var $li_all = $('#keyboard li')

    hotkeys('*', function(evn){
        var key_num = evn.keyCode,str = '';

        str = 'keyCode:' + key_num; 

        if(hotkeys.shift)   str += ', shift';
        if(hotkeys.ctrl)    str += ', ctrl';
        if(hotkeys.alt)     str += ', alt';
        if(hotkeys.control) str += ', control';
        if(hotkeys.command) str += ', command';


        $('#key_info').html(str);

        console.log("evn1",evn,String.fromCharCode(evn.keyCode));

        $li_all.each(function(index, el) {

            var kc = $(el).data('keycode');

            if(kc === key_num) $(el).addClass('pressed');

        });

        return false
    });


    $li_all.on('click',function(){
        var key_num = $(this).data('keycode');

        $('#key_info').html(key_num > -1 ? 'keyCode:' + $(this).data('keycode') : '');

    })

    $(document).on('keyup',function(){
        $li_all.removeClass('pressed');
    })


})(JSLite);


