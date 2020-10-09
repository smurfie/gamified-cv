$(document).ready(function() {
 
    var alertBrowser=false;
    var loaded=0;
    var cvTemplate;
    var cv;
    var sendingMessage=false;
    var stage= new Kinetic.Stage({
        container: 'game',
        width: 500,
        height: 500
    });
    
    var anim;
    
    var slideGame = {
        pieces: [],
        image: "",
        forbid: null,
        time: null
    };
    
    var pairsGame = {
        piecesUp: [],
        piecesDown: [],
        positions: [],
        imagesLoaded: null,
        time: null,
        firstPiece: -1,
        pairsFound: null,
        animRunning: false
    };
    
    var shellGame = {
        piecesDown: [],
        piecesUp: [],
        positions: [],
        loadedStars: 0,
        textScore: null,
        score: null,
        level: null
    };
    
    var mazeGame = {
        time: null,
        squares: null,
        hWalls: null,
        vWalls: null,
        path: null,
        root: null,
        ballMoving: null,
        circle: null
    };
    var img = $("<img id='loader' src='/img/loader.gif'>");
    $('#main').append(img);    
    $.getJSON('/json/cvJoanFluvia.json', function(data){
        cv = data;
        jsonLoaded();
    });
    $.getJSON('/json/cvTemplate.json', function(data){
        cvTemplate = data;
        jsonLoaded();
    });   
    
    function jsonLoaded() {
        loaded++;
        if (loaded == 2) {
            loadPage();
        }
    }
    
    function loadPage() {
        var langCa = $("<div class='lang' data-lang='ca'><img src='/img/ca.jpg'></div>").click(changeLang);
        var langEs = $("<div class='lang' data-lang='es'><img src='/img/es.jpg'></div>").click(changeLang);
        var langEn = $("<div class='lang' data-lang='en'><img src='/img/en.jpg'></div>").click(changeLang);
        
        $('#header').append(langEn);
        $('#header').append(langEs);
        $('#header').append(langCa);
        redArrows();
        loadCVType();        
    }
    
    function redArrows() {
        var redArrow=$("<img src='/img/red-arrow.png'>");
        redArrow.css({
            position:'fixed',
            top:30,
            left:50,
            height:50
        });
        var redArrow2=$("<img src='/img/red-arrow.png'>");
        redArrow2.css({
            position:'fixed',
            top:30,
            height:50,
            left: 200
        });
        $('body').append(redArrow);
        $('body').append(redArrow2);
        redArrow.fadeOut(2000,function(){this.remove()});
        redArrow2.fadeOut(2000,function(){this.remove()});
    }
    
    function loadCVType() {
        var cvType = detectCVType(); //"gamified / boring
        $('#header>span').remove();
        if (cvType=="gamified") {
            $('#header').append($("<span>"+getCVTemplate(10)+"</span>").click(changeCVType));
            $('#header').append($("<span class='selected'>"+getCVTemplate(11)+"</span>").click(changeCVType));
        }
        else{
            $('#header').append($("<span class='selected'>"+getCVTemplate(10)+"</span>").click(changeCVType));
            $('#header').append($("<span>"+getCVTemplate(11)+"</span>").click(changeCVType));
        }        
        loadMain(cvType); //Depending on the CV type maybe is better to call another function
    }
    
    function changeCVType() {
        if ($(this).hasClass("selected")) {
            return;
        }
        var cvType = detectCVType();
        if (cvType =="boring") {
            storeString("cvtype","gamified");
        }
        else{
            storeString("cvtype","boring");
        }
        loadCVType();
    }
    
    function changeLang() {
       storeString("language", $(this).data('lang'));
       fadeOut(loadCVType);       
    }
    
    function loadMain(cvType) {
        $('#main').empty();
        
        loadStars(cvType);
        $('#main').append(loadPicture(cvType));
        
        var personal = $("<div id='personal'></div>");
        var name = $("<p id='name'>"+getCV("name")+"</p>");
        var title = $("<p id='title'>"+getCV("title")+"</p>");
        var address = $("<p>"+getCV("address")+"</p>");
        
        personal.append(name);
        personal.append(title);
        personal.append(address);

        var contactForm=$('<div></div>');
        var contactBody=$('<textarea id="emailMessage" maxlength="2000" placeholder="'+getCVTemplate(22)+'"></textarea>');
        var contactEmail=$('<input id="emailContact" type="email" name="email" maxlength="100" placeholder="'+getCVTemplate(23)+'">');
        var contactButton=$('<div class="button">'+getCVTemplate(24)+'</div>');
        contactButton.click(sendEmail);        
        contactForm.append(contactBody);
        contactForm.append(contactEmail);
        contactForm.append(contactButton);
        personal.append(contactForm);        
        
        var summary=$("<div id='summary'><div class='title'>"+getCVTemplate(31)+"</div><hr></div>");
        var sumList=getCV("summary");
        for (var i=0; i<sumList.length;i++) {
            var sumElem = $("<p>"+sumList[i]+"</p>");
            if (i>0) {
                sumElem.hide();
            }
            summary.append(sumElem);            
        }
        if (sumList.length>1) {
            sumMore=$('<p class="more">'+getCVTemplate(32)+'</p>');
            sumMore.click(function(){
                $('#summary>p').fadeIn();
                $(this).hide()
            });
            summary.append(sumMore);
        }        
        
        var education = $("<div id='education'><div class='title'>"+getCVTemplate(4)+"</div><hr></div>");
        var eduList = getCV("education");
        for (var i=0; i<eduList.length;i++) {
            var element = $("<div class='school'></div>");
            var duration = $("<p class='duration'>"+eduList[i].duration+"</p>");
            var description = $("<ul><li><p>"+eduList[i].description+"</p></li></ul>");
            element.append(duration);
            element.append(description);
            education.append(element);
        }
        
        var titles = $("<div id='titles'><div class='title'>"+getCVTemplate(5)+"</div><hr></div>");
        var titList = getCV("titles");
        for (var i=0; i<titList.length;i++) {
            var element = $("<div class='course'></div>");
            var duration = $("<p class='duration'>"+titList[i].duration+"</p>");
            var description = $("<ul><li><p>"+titList[i].description+"<p></li></ul>");
            element.append(duration);
            element.append(description);
            titles.append(element);
        }
        
        var employment = $("<div id='employment'><div class='title'>"+getCVTemplate(6)+"</div><hr></div>");
        var empList = getCV("experience");
        for (var i=0; i<empList.length;i++) {
            var element = $("<div class='company'></div>");
            var company = $("<p>"+empList[i].company+"</p>");
            element.append(company);
            for (var j=0; j<empList[i]["jobs"].length;j++) {
                var subelement = $("<div class='job'></div>");
                var duration = $("<p class='duration'>"+empList[i]["jobs"][j].duration+": "+empList[i]["jobs"][j].position+"</p>");
                subelement.append(duration);
                var tasks = $("<div class='tasks'></div>");
                var list = $("<ul></ul>");
                for (var x=0; x<+empList[i]["jobs"][j].tasks.length;x++) {
                    var task = $("<li><p>"+empList[i]["jobs"][j].tasks[x]+"</p></li>");
                    list.append(task);
                }
                tasks.append(list);
                subelement.append(tasks);
                element.append(subelement);
            }
            employment.append(element);
        }
        
        var habilities = $("<div id='habilities'><div class='title'>"+getCVTemplate(7)+"</div><hr></div>");
        var habList = getCV("habilities");
        var list = $("<ul></ul>");
        for (var i=0; i<habList.length;i++) {
            var hability = $("<li><p>"+habList[i]+"</p></li>");
            list.append(hability);
        }
        var techs = $("<div id='techs'></div>");
        var techList = getCV("technologies");
        shuffleArray(techList);        
        for (var i=0; i<techList.length;i++) {
            var tech = $("<span class='tech"+techList[i][1]+"'> "+techList[i][0]+" </span>");
            techs.append(tech);
        }
        habilities.append(list);        
        habilities.append(techs);
        
        var languages = $("<div id='languages'><div class='title'>"+getCVTemplate(8)+"</div><hr></div>");
        var list = $("<ul></ul>");
        var langList = getCV("languages");
        for (var i=0; i<langList.length;i++) {
            var language = $("<li><p>"+langList[i][0]+": "+langList[i][1]+"</p></li>");
            list.append(language);
        }
        languages.append(list);
        
        var others = $("<div id='others'><div class='title'>"+getCVTemplate(9)+"</div><hr></div>");
        var otList = getCV("other");
        var list = $("<ul></ul>");
        for (var i=0; i<otList.length;i++) {
            var other = $("<li><p>"+otList[i]+"</p></li>");
            list.append(other);
        }
        others.append(list);        
        
        $('#main').append(personal);
        $('#main').append(summary);
        $('#main').append(education);
        $('#main').append(titles);
        checkGameTitles(cvType);
        $('#main').append(employment);
        checkGameEmployment(cvType);
        $('#main').append(habilities);
        checkGameHabilities(cvType);
        $('#main').append(languages);
        $('#main').append(others);
        fadeIn();
    }
    
    function loadPicture(cvType) {
        var image = $("<div id='image'></div>");
        if (cvType == "gamified" && getCV("picture-game") == "slide") {
            if (!loadString("slideMedal")) {
                var picture = $("<img src='/img/question-mark.jpg' width='200'>").css('cursor','pointer');                
            } else {
                var picture = $("<img src='/img/"+getCV("picture")+"' width='200' title='"+getCVTemplate(13)+"'>").css('cursor','pointer');                
            }   
            picture.click(slideLoadGame);
        } else {
            var picture = $("<img src='/img/"+getCV("picture")+"' width='200'>");
        }
        image.append(picture);
        return image;
    }
    
    function checkGameHabilities(cvType){
        if (cvType == "gamified" && getCV("technologies-game") == "pairs") {
            var picture = $("<img src='/img/question-mark-3.jpg'>");
            picture.css({
                position: "absolute",
                width: $('#habilities').width(),
                height: $('#habilities').height(),
                'cursor':'pointer'
            });
            if (loadString("pairsMedal")) {
                picture.css('opacity',0.2);
            }
            picture.click(pairsLoadGame);
            $('#habilities').prepend(picture);
        }
    }
    
    function checkGameTitles(cvType){
        if (cvType == "gamified" && getCV("titles-game") == "shell") {
            var picture = $("<img src='/img/question-mark-4.jpg'>");
            picture.css({
                position: "absolute",
                width: $('#titles').width(),
                height: $('#titles').height(),
                'cursor':'pointer'
            });
            if (loadString("shellMedal")) {
                picture.css('opacity',0.2);
            }
            picture.click(shellLoadGame);
            $('#titles').prepend(picture);
        }
    }
    
    function checkGameEmployment(cvType){
        if (cvType == "gamified" && getCV("experience-game") == "maze") {
            var picture = $("<img src='/img/question-mark-5.jpg'>");
            picture.css({
                position: "absolute",
                width: $('#employment').width(),
                height: $('#employment').height(),
                'cursor':'pointer'
            });
            if (loadString("mazeMedal")) {
                picture.css('opacity',0.2);
            }
            picture.click(mazeLoadGame);
            $('#employment').prepend(picture);
        }
    }
    
    function loadStars(cvType) {
        $("#stars").empty();
        if (cvType == "gamified") {
            if (getCV("picture-game") == "slide") {
                loadStar("slide");
            }
            if (getCV("titles-game") == "shell") {
                loadStar("shell");
            }
            if (getCV("experience-game") == "maze") {
                loadStar("maze");
            }
            if (getCV("technologies-game") == "pairs") {
                loadStar("pairs");
            }
            var img=$("<img title='"+getCVTemplate(18)+"' src='/img/reset.png' width='30px' height='30px'>");
            img.css('opacity',0.2);
            img.on('mouseenter', function(){
                document.body.style.cursor = "pointer";
                $(this).css('opacity',1);
            }); 
            img.on('mouseleave', function(){
                document.body.style.cursor = "default";
                $(this).css('opacity',0.2);
            });
            img.on('tap click', resetProgress);
            $("#stars").append(img);
            img.css("top",img.index()*30+20);
            loadTrophy();
            showTrophy();
        }
    }
    
    function loadTrophy() {
        var img=$("<img id='trophy' title='"+getCVTemplate(30)+"' src='/img/trophy.png' width='30px' height='30px'>");
        img.css('opacity',0.8);
        img.on('mouseenter', function(){
            document.body.style.cursor = "pointer";
            $(this).css('opacity',1);
        });
        img.on('mouseleave', function(){
            document.body.style.cursor = "default";
            $(this).css('opacity',0.8);
        });
        img.on('tap click', function(){window.open("https://html-games.herokuapp.com/game/snaek");});
        img.css("top",-50);
        img.hide();
        $("#stars").append(img);
    }
    
    function showTrophy() {
        if (loadString("slideMedal") && loadString("shellMedal") && loadString("mazeMedal") && loadString("pairsMedal")) {
            if (loadString("slideMedal") == 'gold' && loadString("shellMedal") == 'gold' && loadString("mazeMedal") == 'gold' && loadString("pairsMedal") == 'gold') {
                $('#trophy').fadeIn();
            }
        }
    }
    
    function loadStar(s) {
        var strImage;
        if (loadString(s+"Medal")) {
            strImage=loadString(s+"Medal")+"-star.png";
        } else {
            strImage="no-star.png";
        }
        var img=$("<img id='"+s+"Star' class='star' src='/img/"+strImage+"' width='30px' height='30px'>");        
        $("#stars").append(img);
        img.css("top",img.index()*30);
    }
    
    function sendEmail() {
        if (sendingMessage) {
            return;
        }
        if ($('#emailMessage').val().length>0 && $('#emailContact').val().length>0) {
            $("#emailMessage").attr("disabled", "disabled");
            $("#emailContact").attr("disabled", "disabled");
            sendingMessage=true;
            $.post("sendEmail",{message: $('#emailMessage').val(), contact:$('#emailContact').val()})
            .done(function(error){
                if (error == "False") { //Correct
                    warningMessage(getCVTemplate(26));
                } else { //Error: Limit 3 messages
                    warningMessage(getCVTemplate(27));
                }
                sendingMessage=false;
                $("#emailMessage").removeAttr("disabled");
                $("#emailContact").removeAttr("disabled");
            })
            .fail(function(data){
                warningMessage(getCVTemplate(28));
                sendingMessage=false;
                $("#emailMessage").removeAttr("disabled");
                $("#emailContact").removeAttr("disabled");
            })
        } else {
            warningMessage(getCVTemplate(29));
        }        
    }
    
    function warningMessage(m) {
        $('#screen').css({"display": "block", opacity: 0.7, "width":$(document).width(),"height":$(document).height(),"z-index":2});
        var dialog = $('<div class="dialog"></div>').css('display','block');
        
        var message = $('<div class="message">'+m+'</div>');
        var accept = $('<div class="button">'+getCVTemplate(25)+'</div>');
        
        var buttons = $('<div class="buttons"></div>')
        accept.click(function(){
            $(this).parent().parent().remove();
            $('#screen').css({"display": "none", "z-index":0});
        });
        dialog.append(message);
        buttons.append(accept);
        dialog.append(buttons);
        $('body').append(dialog);
    }
    
    function resetProgress() {
        $('#screen').css({"display": "block", opacity: 0.7, "width":$(document).width(),"height":$(document).height(),"z-index":2});
        var dialog = $('<div class="dialog"></div>').css('display','block');
        
        var message = $('<div class="message">'+getCVTemplate(19)+'</div>');
        var answerYes = $('<div class="button">'+getCVTemplate(20)+'</div>');
        var answerNo = $('<div class="button">'+getCVTemplate(21)+'</div>');
        var buttons = $('<div class="buttons"></div>')
        answerYes.click(deleteData);
        answerNo.click(function(){
            $(this).parent().parent().remove();
            $('#screen').css({"display": "none", "z-index":0});
        });
        dialog.append(message);
        buttons.append(answerYes);
        buttons.append(answerNo);
        dialog.append(buttons);
        $('body').append(dialog);
    }
    
    function deleteData() {
        $(this).parent().parent().remove();
        $('#screen').css({"display": "none", "z-index":0});
        deleteString('mazeMedal');
        deleteString('mazeTime');
        deleteString('pairsMedal');
        deleteString('pairsTime');
        deleteString('shellMedal');
        deleteString('shellScore');
        deleteString('slideMedal');
        deleteString('slideTime');
        var stars = $("#stars>.star")
        for (var i=0;i<stars.length;i++){
            $(stars[i]).attr('src',"/img/no-star.png");
        }
        $('#image>img').attr('src',"/img/question-mark.jpg");
        $('#image>img').removeAttr('title');
        $('#habilities>img').css('opacity',1);
        $('#titles>img').css('opacity',1);
        $('#employment>img').css('opacity',1);
    }     
    
    function getCV(n) {
        var language = detectLanguage();
        if (cv[language] && cv[language][n]) {
            return cv[language][n];
        }
        return cv["default"][n];
    }
    
    function getCVTemplate(n) {
        var language = detectLanguage();
        if (cvTemplate[language]){
            return cvTemplate[language][n];
        }
        return cvTemplate["default"][n];
    }
    
    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }
    
    function fadeIn() {
        $('#image').hide().fadeIn("slow");
        $('#personal').hide().fadeIn("slow");
        $('#summary').hide().fadeIn("slow");
        $('#education').hide().fadeIn("slow");
        $('#titles').hide().fadeIn("slow");
        $('#employment').hide().fadeIn("slow");
        $('#habilities').hide().fadeIn("slow");
        $('#languages').hide().fadeIn("slow");
        $('#others').hide().fadeIn("slow");
    }
    
    function fadeOut(callback) {
        $('#image').fadeOut("fast");
        $('#personal').fadeOut("fast");
        $('#summary').fadeOut("slow");
        $('#education').fadeOut("fast");
        $('#titles').fadeOut("fast");
        $('#employment').fadeOut("fast");
        $('#habilities').fadeOut("fast");
        $('#languages').fadeOut("fast");
        $('#others').fadeOut("fast",function(){
            callback();
        });
    }

    function detectLanguage() {
        var language = loadString("language");
        if (!language) {        
            if (navigator.appName == 'Netscape'){
                language = navigator.language;
                storeString("language", language);
            }
            else {
                language = navigator.browserLanguage;
                storeString("language", language);
            }
        }
        language = language.slice(0,2);
        if (language != "ca" && language !="es" && language != "en") {
            language = "en";
        }
        return language;
    }
    
    function detectCVType() {
        var CVType = loadString("cvtype");
        if (!CVType) {        
            CVType = "gamified";
            storeString("cvtype", CVType);
        }
        return CVType;
    }
    
    function storeString(key, value) {
       if(typeof(Storage)!=="undefined"){
          localStorage[key]=value;
       }
       else if (!alertBrowser){
          alert("Sorry, your browser does not support web storage. Update your browser");
          alertBrowser=true;
       }
    }
    
    function incrementString(key, value) {
       if(typeof(Storage)!=="undefined"){
          if (localStorage[key]){
             localStorage[key] = parseFloat(localStorage[key]) + value;
          }
          else{
             localStorage[key] = value;
          }
       }
       else if (!alertBrowser){
          alert("Sorry, your browser does not support web storage. Update your browser");
          alertBrowser=true;
       }
    }
    
    function loadString(key) {
       if(typeof(Storage)!=="undefined"){
          return localStorage[key];
       }
       else if (!alertBrowser){
          alert("Sorry, your browser does not support web storage. Update your browser");
          alertBrowser=true;
       }
       return false;
    }
    
    function deleteString(key) {
       if(typeof(Storage)!=="undefined"){
          localStorage.removeItem(key);
       }
       else if (!alertBrowser){
          alert("Sorry, your browser does not support web storage. Update your browser");
          alertBrowser=true;
       }
       return false;
    }
    
    function selectText(element) {
        var doc = document;
        var text = doc.getElementById(element);
        var range;
        var selection;    
        if (doc.body.createTextRange) {
            range = document.body.createTextRange();
            range.moveToElementText(text);
            range.select();
        } else if (window.getSelection) {
            selection = window.getSelection();        
            range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
    
    function pop(){
        $('#screen').css({"display": "block", opacity: 0.7, "width":$(document).width(),"height":$(document).height(),"z-index":2});
        $('#game').css({"display": "block"});
    }
    
    function push() {
        $('#game').css("display", "none");
        $('#screen').css({"display": "none", "z-index":0});
        document.body.style.cursor = "default";
        while (stage.getLayers().length>0) {
            stage.getLayers()[0].remove();
        }
        if (anim) {
            anim.stop();
        }        
    }
    
    function backgroundLayer(color) {
        var layer = new Kinetic.Layer();
        var background = new Kinetic.Rect({
            width: 500,
            height: 500,
            fill: color
        });
        layer.add(background);
        return layer;
    }
    
    function addCloseButton(layer, x, y, w, h) {
        var closeImg = new Image();
        closeImg.onload = function(){
            var close=new Kinetic.Image({
                x: x,
                y: y,
                image: closeImg,
                width: w,
                height: h,
                opacity: 0.5
            });
            close.on('mouseenter', function(){
                document.body.style.cursor = "pointer";
                this.setOpacity(1);
                this.getParent().draw();
            }); 
            close.on('mouseleave', function(){
                document.body.style.cursor = "default";
                this.setOpacity(0.5);
                this.getParent().draw();
            });
            close.on('tap click', push);
            layer.add(close);
            layer.draw();
        }
        closeImg.src="/img/close.png";
    }
    
    function addPlayButton(layer, x, y, w, h, callback) {
        var playImg = new Image();
        playImg.onload = function(){
            var close=new Kinetic.Image({
                x: x,
                y: y,
                image: playImg,
                width: w,
                height: h,
                opacity: 0.5
            });
            close.on('mouseenter', function(){
                document.body.style.cursor = "pointer";
                this.setOpacity(1);
                this.getParent().draw();
            }); 
            close.on('mouseleave', function(){
                document.body.style.cursor = "default";
                this.setOpacity(0.5);
                this.getParent().draw();
            });
            close.on('tap click', callback);
            layer.add(close);
            layer.draw();
        }
        playImg.src="/img/play.png";
    }
    
    function createButton(s, x, y, w, h) {
        var group = new Kinetic.Group({
            x: x,
            y: y,
            width: w,
            height: h
        });    
        var text = new Kinetic.Text({
            text: s,
            fontSize: h/2,
            fontFamily: 'Calibri',
            fill: '#555',
            width: w,
            padding: 8,
            align: 'center'
        });
        var rect = new Kinetic.Rect({
            stroke: '#555',
            strokeWidth: 5,
            fill: '#ddd',
            width: w,
            height: h,
            shadowColor: 'black',
            shadowBlur: 10,
            shadowOffset: [10, 10],
            shadowOpacity: 0.2,
            cornerRadius: 10
        });    
        group.add(rect);
        group.add(text);
        group.on('mouseenter', function(){
            document.body.style.cursor = "pointer";
            this.children[0].setFill("#ef6");
            this.draw();
        });
        group.on('mouseleave', function(){
            document.body.style.cursor = "default";
            this.children[0].setFill("#ddd");
            this.draw();
        });
        return group;
    }
    
    function createText(s, x, y, w, h) {    
        var text = new Kinetic.Text({
            x: x,
            y: y,
            text: s,
            fontSize: h/2,
            fontFamily: 'Calibri',
            fill: '#555',
            width: w,
            align: 'center'
        });
        return text;
    }
    
    function createImage(layer, img, x, y, w, h, o) {
        var objImg = new Image();
        objImg.onload = function(){            
            var image=new Kinetic.Image({
                x: x,
                y: y,
                image: objImg,
                width: w,
                height: h,
                opacity: o
            });
            layer.add(image);
            layer.draw();
        }
        objImg.src= "/img/" + img;
    }
    
    function animateStar(star, improved, game, callback) {
        var img = $("<img id='animatedStar' src='/img/"+star+"-star.png' width='0px' height='0px'>");
        var pos = $("#stars>#"+game+"Star").index();
        $("body").append(img);
        $("#animatedStar").css("display","block");
        $({x: 0}).animate({x: 400}, {
            duration: 2000,
            step: function(now){
                $("#animatedStar").css({
                    width: -Math.abs(-now+300)+300,
                    height: -Math.abs(-now+300)+300,
                    'margin-left': -(-Math.abs(-now+300)+300)/2,
                    'margin-top': -(-Math.abs(-now+300)+300)/2
                });
            },
            complete: function(){
                $({deg: 0}).animate({deg: 360}, {                            
                    duration: 2000,
                    step: function(now){
                        if (improved) {
                            $("#animatedStar").css({
                                transform: "rotate(" + now + "deg)",                                
                                width: 200-170*now/360,
                                height: 200-170*now/360,
                                'margin-left': -100+470*now/360,
                                'margin-top': -100+((55+30*pos)*now)/360
                            });
                        } else {
                            $("#animatedStar").css({
                                transform: "rotate(" + now + "deg)"
                            });
                        }
                    },
                    complete: function(){
                        if (improved) {
                            $("#stars>#"+game+"Star").attr('src',"/img/"+strImage+"-star.png");
                        }
                        $("#animatedStar").remove();
                        showTrophy();
                        callback();
                    }
                });
            }
        });
    }
    
    //SLIDE GAME
    function slideLoadGame() {
        pop();        
        var layer = backgroundLayer("#ccc");
        addPlayButton(layer, 200, 200, 100, 100, slidePlay);
        addCloseButton(layer, 470, 0, 30, 30);
        stage.add(layer);
    }    
    
    function slidePlay() {
        document.body.style.cursor = "default";
        this.getParent().remove();
        var layer = backgroundLayer("#ccc");        
        stage.add(layer);
        
        //Add the pieces and trigger the shuffling
        var questionImg = new Image();
        questionImg.onload = function(){
            for (var i=0;i<9;i++) {
                var question=new Kinetic.Image({
                    x: (i%3)*500/3+1,
                    y: Math.floor(i/3)*500/3+1,
                    image: questionImg,
                    width: 500/3-2,
                    height: 500/3-2
                });
                layer.add(question);
            }
            addCloseButton(layer, 470, 0, 30, 30);            
            anim = new Kinetic.Animation(function(frame) {
                var opacity = Math.max(0,(1000-frame.time)/1000)
                layer.getChildren()[9].setOpacity(opacity);
                if (opacity <= 0) {
                    anim.stop();
                    layer.getChildren()[9].hide();
                    slideShufflePieces();
                }
            }, layer);
            anim.start();
        }
        questionImg.src="/img/question-mark-2.jpg";
    }
    
    function slideShufflePieces() {
        for (var i=0; i<8; i++) {
            slideGame.pieces[i]=i;
        }
        slideGame.pieces[8]=1000;
        slideGame.forbid=0;
        slideShuffleTimes(10);
    }
    
    function slideShuffleTimes(times) {
        var speed=1;
        if (times<=0) {
            var shuffled = true;
            for (var i=0; i<9; i++) {
                if (slideGame.pieces[i]==i){
                    shuffled=false;
                }
            }
            if (shuffled) {
                slideUntapHiddenImage();
                return;
            }
            speed+=(-times/10);
        }
        var n;
        var moves=[];
        var rand;
        var whatPiece;
        for (var i=0; i<9; i++) {
            if (slideGame.pieces[i]==1000){
                n=i;
            }
        }
        if (n-2>0 && n-3!=slideGame.forbid) {
            moves[moves.length]=n-3;
        }
        if (n+2<8 && n+3!=slideGame.forbid) {
            moves[moves.length]=n+3;
        }
        if (n%3!=2 && n+1!=slideGame.forbid) {
            moves[moves.length]=n+1;
        }
        if (n%3!=0 && n-1!=slideGame.forbid) {
            moves[moves.length]=n-1;
        }
        rand=Math.floor(Math.random()*moves.length);
        whatPiece=moves[rand];
        slideMovePiece(whatPiece, speed, slideShuffleTimes, times-1);
    }
    
    function slideMovePiece(whatPiece, speed, callback, data) {
        var n;
        for (var i=0; i<9; i++) {
            if (slideGame.pieces[i]==1000){
                n=i;
            }
        }
        //If it can't move return
        if (n-3!=whatPiece && n+3!=whatPiece && (Math.floor(n/3)!=Math.floor(whatPiece/3) || Math.abs(n%3-whatPiece%3)==2)) {
            return false;
        }
        anim = new Kinetic.Animation(function(frame) {
            var x;
            var y;
            if (n>whatPiece) {
                x = Math.min(1+(n%3)*500/3, 1+(whatPiece%3)*500/3+speed*frame.time);
                y = Math.min(1+Math.floor(n/3)*500/3, 1+Math.floor(whatPiece/3)*500/3+speed*frame.time);
            } else {
                x = Math.max(1+(n%3)*500/3, 1+(whatPiece%3)*500/3-speed*frame.time);
                y = Math.max(1+Math.floor(n/3)*500/3, 1+Math.floor(whatPiece/3)*500/3-speed*frame.time);
            }
            stage.getLayers()[0].getChildren()[slideGame.pieces[whatPiece]+1].setX(x);
            stage.getLayers()[0].getChildren()[slideGame.pieces[whatPiece]+1].setY(y);
            if (speed*frame.time > 500/3) {
                anim.stop();
                slideGame.forbid=n;
                slideGame.pieces[n]=slideGame.pieces[whatPiece];
                slideGame.pieces[whatPiece]=1000;
                if (callback) {
                    callback(data);
                }
            }
        }, stage.getLayers()[0]);
        anim.start();
        return true;
    }
    
    function slideUntapHiddenImage(){
        slideGame.image = new Image();
        slideGame.image.onload = slideReversePieces;
        slideGame.image.src="/img/"+getCV("picture");
    }
    
    function slideReversePieces() {
        anim = new Kinetic.Animation(function(frame) {
            if (frame.time < 500) {
                for (var i=0;i<9;i++) {
                    if (slideGame.pieces[i]!=1000) {
                        stage.getLayers()[0].getChildren()[slideGame.pieces[i]+1].setX((i%3)*500/3+1+frame.time/6-frame.time/3000);
                        stage.getLayers()[0].getChildren()[slideGame.pieces[i]+1].setWidth(500/3-2-frame.time/3+frame.time/1000);
                    }
                }
            }else{
                for (var i=0;i<8;i++) {
                    stage.getLayers()[0].getChildren()[i+1].hide();
                }
                anim.stop();
                //once reversed we load the images
                for (var i=0;i<9;i++) {
                    if (slideGame.pieces[i]!=1000) {
                        stage.getLayers()[0].getChildren()[slideGame.pieces[i]+1].setImage(slideGame.image);
                        stage.getLayers()[0].getChildren()[slideGame.pieces[i]+1].setCrop({
                            x:(slideGame.pieces[i]%3)*slideGame.image.width/3,
                            y:Math.floor(slideGame.pieces[i]/3)*slideGame.image.height/3,
                            width: slideGame.image.width/3,
                            height: slideGame.image.height/3
                        });
                    }
                }
                //and the 9-piece
                stage.getLayers()[0].getChildren()[9].setImage(slideGame.image);
                stage.getLayers()[0].getChildren()[9].setCrop({
                    x:2*slideGame.image.width/3,
                    y:2*slideGame.image.height/3,
                    width: slideGame.image.width/3,
                    height: slideGame.image.height/3
                });
                //and reverse the images back
                for (var i=0;i<8;i++) {
                    stage.getLayers()[0].getChildren()[i+1].show();
                }
                anim=new Kinetic.Animation(function(frame) {
                    if (frame.time < 500) {
                        for (var i=0;i<9;i++) {
                            if (slideGame.pieces[i]!=1000) {
                                stage.getLayers()[0].getChildren()[slideGame.pieces[i]+1].setX((i%3)*500/3+500/6-frame.time/6+frame.time/3000);
                                stage.getLayers()[0].getChildren()[slideGame.pieces[i]+1].setWidth(frame.time/3-frame.time/1000);
                            }
                        }
                    }else{
                        for (var i=0;i<9;i++) {
                            if (slideGame.pieces[i]!=1000) {
                                stage.getLayers()[0].getChildren()[slideGame.pieces[i]+1].setX((i%3)*500/3+1);
                                stage.getLayers()[0].getChildren()[slideGame.pieces[i]+1].setWidth(500/3-2);
                            }
                        }
                        anim.stop();
                        slidePieceEvents();
                    }
                }, stage.getLayers()[0]);
                anim.start();
            }
        }, stage.getLayers()[0]);
        anim.start();
    }
    
    function slidePieceEvents() {
        for (var i=0;i<8;i++) {
            stage.getLayers()[0].getChildren()[i+1].on('mouseenter', function(){
                document.body.style.cursor = "pointer";
            }); 
            stage.getLayers()[0].getChildren()[i+1].on('mouseleave', function(){
                document.body.style.cursor = "default";
            });
            stage.getLayers()[0].getChildren()[i+1].on('tap click', function(){
                document.body.style.cursor = "default";
                var whatPiece;
                for (var i=0;i<9;i++) {
                    if (slideGame.pieces[i]==this.index-1) {
                        whatPiece=i;
                    }
                }
                slideMovePiece(whatPiece, 1, slideCheckCompleted, null);
            });
        }
        slideGame.time = new Date().getTime();
    }
    
    function slideCheckCompleted() {
        var completed = true;
        for (var i=0;i<8;i++) {
            if (slideGame.pieces[i]!=i) {
                completed = false;
            }
        }
        if (completed) {
            slideGame.time = new Date().getTime()-slideGame.time;
            for (var i=0;i<8;i++) {
                stage.getLayers()[0].getChildren()[i+1].off('mouseenter');
                stage.getLayers()[0].getChildren()[i+1].off('mouseleave');
                stage.getLayers()[0].getChildren()[i+1].off('click');
            }
            stage.getLayers()[0].getChildren()[9].show();
            //Make the last piece apear
            anim=new Kinetic.Animation(function(frame) {
                if (frame.time < 500) {
                    stage.getLayers()[0].getChildren()[9].setOpacity(frame.time/500);
                }else{
                    stage.getLayers()[0].getChildren()[9].setOpacity(1);
                    anim.stop();
                    slideGameCompleted();
                }
            }, stage.getLayers()[0]);
            anim.start();
        }
    }
    
    function slideGameCompleted() {
        //Complete image
        for (var i=0; i<9; i++) {
            stage.getLayers()[0].getChildren()[i+1].setX(stage.getLayers()[0].getChildren()[i+1].getX()-1);
            stage.getLayers()[0].getChildren()[i+1].setY(stage.getLayers()[0].getChildren()[i+1].getY()-1);
            stage.getLayers()[0].getChildren()[i+1].setHeight(stage.getLayers()[0].getChildren()[i+1].getHeight()+2);
            stage.getLayers()[0].getChildren()[i+1].setWidth(stage.getLayers()[0].getChildren()[i+1].getWidth()+2);
        }
        stage.getLayers()[0].getChildren()[10].remove();
        stage.getLayers()[0].draw();
        var star = slideMedal();        
        var previousMedal=loadString("slideMedal");
        var improved = false;
        
        if (!loadString("slideTime") || slideGame.time < loadString("slideTime")) {
            improved = true;
            storeString("slideMedal", star);
            storeString("slideTime", slideGame.time);
        }
        animateStar(star, improved, "slide", slideEndScreen);      
    }    
    
    function slideMedal() {
        if (slideGame.time <10000) {
            strImage="gold";
        } else if (slideGame.time <20000) {
            strImage="silver";
        } else{
            strImage="bronze";
        }
        return strImage;
    }
    
    function slideEndScreen() {
        $('#image>img').attr('src',"/img/"+getCV("picture"));
        $('#image>img').attr('title', getCVTemplate(13));
        stage.getLayers()[0].remove()
        var layer = backgroundLayer("#ccc");
        var text = createText(getCVTemplate(14)+": "+Math.round(slideGame.time/10)/100, 0, 40, 500, 80);
        layer.add(text);
        var highscore = slideGame.time;
        if (loadString("slideTime") && slideGame.time>parseInt(loadString("slideTime"))) {
            highscore = loadString("slideTime");
        }
        var bestText = createText(getCVTemplate(15)+": "+Math.round(highscore/10)/100, 0, 80, 500, 100);
        layer.add(bestText);
        var textBronze = createText("--.--", 50, 250, 100, 50);
        layer.add(textBronze);
        var textSilver = createText("20.00", 200, 250, 100, 50);
        layer.add(textSilver);
        var textGold = createText("10.00", 350, 250, 100, 50);
        layer.add(textGold);
        
        createImage(layer,"bronze-star.png", 50, 150, 100, 100, 1);
        if (highscore<20000) {
            createImage(layer,"silver-star.png", 200, 150, 100, 100, 1);
        } else{
            createImage(layer,"silver-star.png", 200, 150, 100, 100, 0.3);
        }
        if (highscore<10000) {
            createImage(layer,"gold-star.png", 350, 150, 100, 100, 1);
        } else {
            createImage(layer,"gold-star.png", 350, 150, 100, 100, 0.3);
        }          
        addPlayButton(layer, 100, 325, 100, 100, slidePlay);
        addCloseButton(layer, 300, 325, 100, 100);
        stage.add(layer);
    }
    
    //PAIRS
    function pairsLoadGame() {
        pop();        
        var layer = backgroundLayer("#ccc");
        var text = createText(getCVTemplate(16)+"...",0,100,500,80);
        var images = getCV("technologies-game-images");
        pairsGame.imagesLoaded = 0;
        var text2 = createText("("+pairsGame.imagesLoaded+"/"+(images.length+1)+")...",0,200,500,80);
        layer.add(text);
        layer.add(text2);
        addCloseButton(layer, 470, 0, 30, 30);
        stage.add(layer);
        if (pairsGame.piecesUp.length) { //If loaded before...
            pairsStartScreen();
        } else {
            for (var i=0; i<images.length; i++) {
                var img = new Image();
                img.onload = function(){
                    pairsGame.piecesUp[2*this.index]=new Kinetic.Image({
                        image: this,
                        fill: "#fff"
                    });
                    pairsGame.piecesUp[2*this.index+1]=new Kinetic.Image({
                        image: this,
                        fill: "#fff"
                    });
                    pairsGame.imagesLoaded++;
                    pairsCheckLoaded();
                }
                img.index=i;
                img.src="/img/logos/"+images[i];
            }
            var img = new Image();
            img.onload = function(){
                for (var i=0; i<2*images.length; i++) {
                    pairsGame.piecesDown[i]=new Kinetic.Image({
                        image: this,
                    });
                    pairsGame.piecesDown[i].on('mouseenter', function(){
                        document.body.style.cursor = "pointer";
                    }); 
                    pairsGame.piecesDown[i].on('mouseleave', function(){
                        document.body.style.cursor = "default";
                    });
                    pairsGame.piecesDown[i].position=i;
                    pairsGame.piecesDown[i].on('tap click', function(){
                        pairsReverse(this.position);
                    });
                }
                pairsGame.imagesLoaded++;
                pairsCheckLoaded();
            }
            img.src="/img/question-mark-2.jpg";
        }
    }
    
    function pairsCheckLoaded() {
        stage.getLayers()[0].getChildren()[2].setText("("+pairsGame.imagesLoaded+"/"+(getCV("technologies-game-images").length+1)+")...");
        stage.getLayers()[0].draw();
        if (pairsGame.imagesLoaded==getCV("technologies-game-images").length+1) {
            pairsStartScreen();
        }
    }
    
    function pairsStartScreen() {
        stage.getLayers()[0].remove();
        var layer = backgroundLayer("#ccc");
        addPlayButton(layer, 200, 200, 100, 100, pairsPlay);
        addCloseButton(layer, 470, 0, 30, 30);
        stage.add(layer);
    }
    
    function pairsPlay(args) {
        stage.getLayers()[0].remove();
        var layer = backgroundLayer("#e81");
        addCloseButton(layer, 470, 0, 30, 30);
        stage.add(layer);
        pairsGame.pairsFound = 0;
        for (var i=0; i<18; i++) {
            pairsGame.positions[i]=2*i;
        }
        shuffleArray(pairsGame.positions);
        for (var i=0; i<8; i++){ //We only use the first 8 pieces and duplicate them
            pairsGame.positions[i+8]=pairsGame.positions[i]+1;
        }
        pairsGame.positions.splice(16,2);
        shuffleArray(pairsGame.positions);
        for (var i=0; i<16; i++) {
            pairsGame.piecesDown[pairsGame.positions[i]].setX((i%4)*500/4+1);
            pairsGame.piecesDown[pairsGame.positions[i]].setY(Math.floor(i/4)*500/4+1);
            pairsGame.piecesDown[pairsGame.positions[i]].setWidth(500/4-2);
            pairsGame.piecesDown[pairsGame.positions[i]].setHeight(500/4-2);
            pairsGame.piecesUp[pairsGame.positions[i]].setX((i%4)*500/4+1);
            pairsGame.piecesUp[pairsGame.positions[i]].setY(Math.floor(i/4)*500/4+1);
            pairsGame.piecesUp[pairsGame.positions[i]].setWidth(1);
            pairsGame.piecesUp[pairsGame.positions[i]].setHeight(500/4-2);
            layer.add(pairsGame.piecesDown[pairsGame.positions[i]]);
            layer.add(pairsGame.piecesUp[pairsGame.positions[i]]);
            pairsGame.piecesDown[pairsGame.positions[i]].show();
            pairsGame.piecesUp[pairsGame.positions[i]].hide();
        }
        pairsGame.time = new Date().getTime();
    }
    
    function pairsReverse(position) {
        if (pairsGame.animRunning) {
            return;
        }        
        var pos = pairsGame.positions.indexOf(position);
        pairsGame.animRunning=true;
        anim = new Kinetic.Animation(function(frame) {
            var image = pairsGame.piecesDown[position];
            image.setWidth(Math.max(500/4-2-frame.time*492/500,1));
            image.setX((pos%4)*500/4+1+(frame.time*496/1000));
            if (frame.time >= 125) {
                image.hide();
                anim.stop();
                var image2 = pairsGame.piecesUp[position];
                image2.setWidth(1);
                image2.setX((pos%4)*500/4+500/8);
                image2.show();                
                anim = new Kinetic.Animation(function(frame) {
                    image2.setWidth(frame.time*492/500);
                    image2.setX((pos%4)*500/4+500/8-(frame.time*496/1000));
                    if (frame.time >= 125) {                        
                        image2.setWidth(500/4-2);
                        image2.setX((pos%4)*500/4+1);
                        anim.stop();
                        if (pairsGame.firstPiece == -1) {
                            pairsGame.firstPiece = position;
                            pairsGame.animRunning=false;
                        } else if(Math.floor(pairsGame.firstPiece/2)==Math.floor(position/2)){
                            //Pair found
                            pairsGame.firstPiece = -1;
                            pairsGame.pairsFound++
                            pairsGame.animRunning=false;
                            if (pairsGame.pairsFound == 8) {
                                pairsGameCompleted();                                
                            }                            
                        } else {
                            //Reverse                            
                            pairsInverse(pairsGame.firstPiece, position);
                            pairsGame.firstPiece = -1;
                        }                                                
                    }
                }, stage.getLayers()[0]);
                anim.start();   
            }
        }, stage.getLayers()[0]);
        anim.start();
    }
    
    function pairsInverse(position1, position2) {       
        var pos1 = pairsGame.positions.indexOf(position1);
        var pos2 = pairsGame.positions.indexOf(position2);
        anim = new Kinetic.Animation(function(frame) {
            if (frame.time>500) {
                var image1 = pairsGame.piecesUp[position1];
                var image2 = pairsGame.piecesUp[position2];
                image1.setWidth(Math.max(500/4-2-(frame.time-500)*492/500,1));
                image2.setWidth(Math.max(500/4-2-(frame.time-500)*492/500,1));
                image2.setX((pos1%4)*500/4+1+((frame.time-500)*496/1000));
                image2.setX((pos2%4)*500/4+1+((frame.time-500)*496/1000));
                if (frame.time >= 625) {
                    image1.hide();
                    image2.hide();
                    anim.stop();
                    var image3 = pairsGame.piecesDown[position1];
                    var image4 = pairsGame.piecesDown[position2];
                    image3.setWidth(1);
                    image4.setWidth(1);
                    image3.setX((pos1%4)*500/4+500/8);
                    image4.setX((pos2%4)*500/4+500/8);
                    image3.show();
                    image4.show();
                    anim = new Kinetic.Animation(function(frame) {
                        image3.setWidth(frame.time*492/500);
                        image4.setWidth(frame.time*492/500);
                        image3.setX((pos1%4)*500/4+500/8-(frame.time*496/1000));
                        image4.setX((pos2%4)*500/4+500/8-(frame.time*496/1000));
                        if (frame.time >= 125) {                        
                            image3.setWidth(500/4-2);
                            image4.setWidth(500/4-2);
                            image3.setX((pos1%4)*500/4+1);
                            image4.setX((pos2%4)*500/4+1);
                            anim.stop();                   
                            pairsGame.animRunning=false;                                            
                        }
                    }, stage.getLayers()[0]);
                    anim.start();   
                }   
            }
        }, stage.getLayers()[0]);
        anim.start();
    }
    
    function pairsGameCompleted() {
        pairsGame.time = new Date().getTime()-pairsGame.time;
        var star = pairsMedal();        
        var previousMedal=loadString("pairsMedal");
        var improved = false;        
        
        stage.getLayers()[0].getChildren()[33].remove();
        if (!loadString("pairsTime") || pairsGame.time < loadString("pairsTime")) {
            improved = true;
            storeString("pairsMedal", star);
            storeString("pairsTime", pairsGame.time);
        }
        animateStar(star, improved, "pairs", pairsEndScreen);      
    }    
    
    function pairsMedal() {
        if (pairsGame.time <25000) {
            strImage="gold";
        } else if (pairsGame.time <35000) {
            strImage="silver";
        } else{
            strImage="bronze";
        }
        return strImage;
    }
    
    function pairsEndScreen() {
        $('#habilities>img').css('opacity',0.2);
        stage.getLayers()[0].remove();
        var layer = backgroundLayer("#ccc");
        var text = createText(getCVTemplate(14)+": "+Math.round(pairsGame.time/10)/100, 0, 40, 500, 80);
        layer.add(text);
        var highscore = pairsGame.time;
        if (loadString("pairsTime") && pairsGame.time>parseInt(loadString("pairsTime"))) {
            highscore = loadString("pairsTime");
        }
        var bestText = createText(getCVTemplate(15)+": "+Math.round(highscore/10)/100, 0, 80, 500, 100);
        layer.add(bestText);
        var textBronze = createText("--.--", 50, 250, 100, 50);
        layer.add(textBronze);
        var textSilver = createText("35.00", 200, 250, 100, 50);
        layer.add(textSilver);
        var textGold = createText("25.00", 350, 250, 100, 50);
        layer.add(textGold);
        
        createImage(layer,"bronze-star.png", 50, 150, 100, 100, 1);
        if (highscore<20000) {
            createImage(layer,"silver-star.png", 200, 150, 100, 100, 1);
        } else{
            createImage(layer,"silver-star.png", 200, 150, 100, 100, 0.3);
        }
        if (highscore<10000) {
            createImage(layer,"gold-star.png", 350, 150, 100, 100, 1);
        } else {
            createImage(layer,"gold-star.png", 350, 150, 100, 100, 0.3);
        }          
        addPlayButton(layer, 100, 325, 100, 100, pairsPlay);
        addCloseButton(layer, 300, 325, 100, 100);
        stage.add(layer);
    }
    
    //SHELL
    function shellLoadGame() {
        pop();        
        var layer = backgroundLayer("#ccc");
        addPlayButton(layer, 200, 200, 100, 100, shellPlay);
        addCloseButton(layer, 470, 0, 30, 30);
        stage.add(layer);
    }
    
    function shellPlay() {
        document.body.style.cursor = "default";
        this.getParent().remove();
        var layer = backgroundLayer("#ccc");        
        stage.add(layer);
        addCloseButton(layer, 470, 0, 30, 30);
        if (shellCheckLoadedStars()){return;}
        var questionImg = new Image();
        questionImg.onload = function(){
            for (var i=0;i<3;i++) {
                shellGame.piecesDown[i]=new Kinetic.Image({
                    image: questionImg,
                    height: 100,
                    stroke: '#a44',
                    strokeWidth: 3
                });
                shellGame.piecesDown[i].on('mouseenter', function(){
                    document.body.style.cursor = "pointer";
                }); 
                shellGame.piecesDown[i].on('mouseleave', function(){
                    document.body.style.cursor = "default";
                });
                shellGame.piecesDown[i].shellIndex = i;
                shellGame.piecesDown[i].on('tap click', shellSolution);
                shellGame.piecesDown[i].setListening(false);
            }            
            shellLoadStars();
            layer.draw();
        }
        questionImg.src="/img/question-mark-2.jpg";
    }
    
    function shellLoadStars() {
        var goldStarImg = new Image();
        goldStarImg.onload = function(){
            shellGame.piecesUp[1]=new Kinetic.Image({
                image: goldStarImg,
                height: 100,
                stroke: '#4a4',
                strokeWidth: 3,
                fill: '#fff'
            });
            shellGame.loadedStars++;
            shellCheckLoadedStars();
        }
        goldStarImg.src="/img/gold-star.png";
        var silverStarImg = new Image();
        silverStarImg.onload = function(){
            for (var i=0;i<3;i+=2) {
                shellGame.piecesUp[i]=new Kinetic.Image({
                    image: silverStarImg,
                    height: 100,
                    stroke: '#a44',
                    strokeWidth: 3,
                    fill: '#fff'
                });
            }
            shellGame.loadedStars++;
            shellCheckLoadedStars();
        }
        silverStarImg.src="/img/silver-star.png";
    }
    
    function shellCheckLoadedStars() {
        if (shellGame.loadedStars == 2) {
            for (var i=0; i<3; i++) {
                shellGame.piecesUp[i].setX(50+150*i);
                shellGame.piecesUp[i].setY(200);
                shellGame.piecesUp[i].setWidth(100);
                shellGame.piecesUp[i].show();
                stage.getLayers()[0].add(shellGame.piecesUp[i]);
                shellGame.piecesDown[i].setX(50+150*i);
                shellGame.piecesDown[i].setY(200);
                shellGame.piecesUp[i].setHeight(100);
                shellGame.piecesDown[i].hide();
                stage.getLayers()[0].add(shellGame.piecesDown[i]);
            }
            shellGame.positions = [0,1,2];
            shellBeginGame();
            return true;
        }
        return false;
    }
    
    function shellBeginGame() {
        shellGame.textScore = createText("Gold Stars (0/5)", 50, 20, 150, 30);
        shellGame.textScore.setAlign('left');
        shellGame.score = 0;
        stage.getLayers()[0].add(shellGame.textScore);
        shellGame.level = 1;
        shellStartLevel();
    }
    
    function shellStartLevel() {
        var level = shellGame.level;        
        var text = createText("Level "+level, 100,70,300,100);
        stage.getLayers()[0].add(text);
        anim = new Kinetic.Animation(function(frame) {
            var opacity = Math.max(0,(1000-frame.time)/1000)
            text.setOpacity(opacity);
            if (frame.time>1000 && frame.time<2000){
                for (var i=0; i<3; i++) {
                    if (frame.time<1500) {                
                        shellGame.piecesDown[shellGame.positions[i]].hide();
                        shellGame.piecesUp[shellGame.positions[i]].show();
                        shellGame.piecesUp[shellGame.positions[i]].setX(50+150*i+(frame.time-1000)/10);
                        shellGame.piecesUp[shellGame.positions[i]].setWidth(Math.max(1,100-(frame.time-1000)/5));
                    } else {
                        shellGame.piecesUp[shellGame.positions[i]].hide();
                        shellGame.piecesDown[shellGame.positions[i]].show();
                        shellGame.piecesDown[shellGame.positions[i]].setX(100+150*i-(frame.time-1500)/10);
                        shellGame.piecesDown[shellGame.positions[i]].setWidth(Math.max(1,(frame.time-1500)/5));
                    }
                }
            }            
            if (frame.time >= 2000) {
                for (var i=0; i<3; i++) {
                    shellGame.piecesUp[shellGame.positions[i]].hide();
                    shellGame.piecesDown[shellGame.positions[i]].show();
                    shellGame.piecesDown[shellGame.positions[i]].setX(50+150*i);
                    shellGame.piecesDown[shellGame.positions[i]].setWidth(100);
                }
                anim.stop();
                shellShufflePieces(level);
            }
        }, stage.getLayers()[0]);
        anim.start();
    }
    
    function shellShufflePieces(level) {
        shellShufflePiecesNTimes(2*level+3,level);
    }
    
    function shellShufflePiecesNTimes(times,level){
        var untouched = Math.floor(Math.random()*3);
        var pos = [0,1,2];
        pos.splice(untouched,1);
        var x=pos[0];
        var y=pos[1];
        var posx;
        var posy;
        for (var i=0;i<3;i++) {
            if (shellGame.positions[i]==x) {
                posx = i;
            }
            if (shellGame.positions[i]==y) {
                posy = i;
            }
        }
        anim = new Kinetic.Animation(function(frame) {
            shellGame.piecesDown[x].setX(50+150*posx+(150*(posy-posx)*frame.time*level/1000));
            shellGame.piecesDown[x].setY(200-150*Math.sin(Math.PI*frame.time*level/1000));
            shellGame.piecesDown[y].setX(50+150*posy+(150*(posx-posy)*frame.time*level/1000));
            shellGame.piecesDown[y].setY(200+150*Math.sin(Math.PI*frame.time*level/1000));
            if (frame.time>=1000/level) {
                anim.stop();
                //Posar les peces be i fer el canvi al vector positions
                shellGame.piecesDown[x].setX(50+150*posy);
                shellGame.piecesDown[x].setY(200);
                shellGame.piecesDown[y].setX(50+150*posx);
                shellGame.piecesDown[y].setY(200);
                for (var i=0; i<3; i++) {
                    if (shellGame.positions[i]==x) {
                        shellGame.positions[i]=y;
                    } else if (shellGame.positions[i]==y) {
                        shellGame.positions[i]=x;
                    }
                }
                if (times>1) {
                    shellShufflePiecesNTimes(times-1,level);
                } else {
                    for (var i=0; i<3; i++) {
                        shellGame.piecesDown[i].setListening(true);
                    }
                }
            }
        }, stage.getLayers()[0]);
        anim.start();
    }
    
    function shellSolution(){
        var piece = this.shellIndex;
        if (piece == 1){
            shellGame.score++;
            shellGame.textScore.setText("Gold Stars ("+shellGame.score+"/5)");
        }
        var pos;
        for (var i=0; i<3; i++) {
            shellGame.piecesDown[i].setListening(false);
            if (shellGame.positions[i]==piece) {                
                pos = i;
            }
        }
        anim = new Kinetic.Animation(function(frame) {
            if (frame.time<500){            
                shellGame.piecesUp[piece].hide();                
                shellGame.piecesDown[piece].setX(50+150*pos+(frame.time)/10);
                shellGame.piecesDown[piece].setWidth(100-frame.time/5);
                shellGame.piecesDown[piece].show();
            } else {
                shellGame.piecesDown[piece].hide();                
                shellGame.piecesUp[piece].setX(100+150*pos -(frame.time-500)/10);
                shellGame.piecesUp[piece].setWidth(Math.max(1,(frame.time-500)/5));
                shellGame.piecesUp[piece].show();
            }
            if (frame.time >1000) {
                shellGame.piecesUp[piece].setX(50+150*pos);
                shellGame.piecesUp[piece].setWidth(100);
                for (var i=0;i<3;i++) {
                    if (shellGame.positions[i]!=piece) {
                        if (frame.time<1500){            
                            shellGame.piecesUp[shellGame.positions[i]].hide();                            
                            shellGame.piecesDown[shellGame.positions[i]].setX(50+150*i+(frame.time-1000)/10);
                            shellGame.piecesDown[shellGame.positions[i]].setWidth(100-(frame.time-1000)/5);
                            shellGame.piecesDown[shellGame.positions[i]].show();
                        } else {
                            shellGame.piecesDown[shellGame.positions[i]].hide();                            
                            shellGame.piecesUp[shellGame.positions[i]].setX(100+150*i -(frame.time-1500)/10);
                            shellGame.piecesUp[shellGame.positions[i]].setWidth(Math.max(1,(frame.time-1500)/5));
                            shellGame.piecesUp[shellGame.positions[i]].show();
                        }
                    }
                }
            }     
            if (frame.time>2000) {
                anim.stop();
                if (shellGame.level<5) {
                    shellGame.level++;
                    shellStartLevel();
                }else{
                    var star = shellMedal();        
                    var previousMedal=loadString("shellMedal");
                    var improved = false;
                    
                    if (!loadString("shellScore") || shellGame.score > loadString("shellScore")) {
                        improved = true;
                        storeString("shellMedal", star);
                        storeString("shellScore", shellGame.score);
                    }
                    animateStar(star, improved, "shell", shellEndScreen);      
                }
            }            
        }, stage.getLayers()[0]);
        anim.start();
    }
    
    function shellMedal() {
        if (shellGame.score > 4) {
            strImage="gold";
        } else if (shellGame.score > 3) {
            strImage="silver";
        } else{
            strImage="bronze";
        }
        return strImage;
    }
    
    function shellEndScreen() {
        $('#titles>img').css('opacity',0.2);
        stage.getLayers()[0].remove();
        var layer = backgroundLayer("#ccc");
        var text = createText(getCVTemplate(17)+": "+shellGame.score+"/5", 0, 40, 500, 80);
        layer.add(text);
        var highscore = shellGame.score;
        if (loadString("shellScore") && shellGame.score<parseInt(loadString("shellScore"))) {
            highscore = loadString("shellScore");
        }
        var bestText = createText(getCVTemplate(15)+": "+highscore+"/5", 0, 80, 500, 100);
        layer.add(bestText);
        var textBronze = createText("(-/5)", 50, 250, 100, 50);
        layer.add(textBronze);
        var textSilver = createText("(4/5)", 200, 250, 100, 50);
        layer.add(textSilver);
        var textGold = createText("(5/5)", 350, 250, 100, 50);
        layer.add(textGold);
        
        createImage(layer,"bronze-star.png", 50, 150, 100, 100, 1);
        if (highscore>3) {
            createImage(layer,"silver-star.png", 200, 150, 100, 100, 1);
        } else{
            createImage(layer,"silver-star.png", 200, 150, 100, 100, 0.3);
        }
        if (highscore>4) {
            createImage(layer,"gold-star.png", 350, 150, 100, 100, 1);
        } else {
            createImage(layer,"gold-star.png", 350, 150, 100, 100, 0.3);
        }          
        addPlayButton(layer, 100, 325, 100, 100, shellPlay);
        addCloseButton(layer, 300, 325, 100, 100);
        stage.add(layer);
    }
    
    //MAZE
    function mazeLoadGame() {
        pop();        
        var layer = backgroundLayer("#ccc");
        addPlayButton(layer, 200, 200, 100, 100, mazePlay);
        addCloseButton(layer, 470, 0, 30, 30);
        stage.add(layer);
    }
    
    function mazePlay() {
        document.body.style.cursor = "default";
        this.getParent().remove();
        var mazeLayer = backgroundLayer("#ccc");        
        stage.add(mazeLayer);        
        addCloseButton(mazeLayer, 470, 0, 30, 30);
        
        var line = new Kinetic.Line({
            points: [12,0,12,488,488,488,488,12,12,12],
            stroke: 'black',
            strokeWidth:26
        });
        mazeLayer.add(line);
        mazeCreate();
    }
    
    function mazeCreate() {
        mazeInitialize();
        mazeGame.squares[0][0]=true;
        mazeGame.path=[[0,0]];
        mazeIterativeCreate();
        mazeDrawMaze();
        mazeMakeTree();
        
        mazeGame.circle=new Kinetic.Circle({
            x:40+30*mazeGame.root.cellPathStart[1],
            y:40+30*mazeGame.root.cellPathStart[0],
            radius: 10,
            fill: 'red',
            stroke: 'black'
        });
        var circle=new Kinetic.Circle({
            x:40+30*mazeGame.root.cellPathEnd[1],
            y:40+30*mazeGame.root.cellPathEnd[0],
            radius: 10,
            fill: '#333',
            stroke: '#333'
        });        
        stage.getLayers()[0].add(circle);
        var layerBall = new Kinetic.Layer();
        layerBall.add(mazeGame.circle);
        var rect = new Kinetic.Rect({
            x:25,
            y:25,
            width:450,
            height:450,
            opacity:0
        });
        rect.on('mouseenter', function(){
            document.body.style.cursor = "pointer";
        }); 
        rect.on('mouseleave', function(){
            document.body.style.cursor = "default";
        });
        rect.on('touchstart mousedown', mazeBallIni); 
        rect.on('touchend mouseup', mazeBallEnd);
        mazeGame.ballMoving=false;
        layerBall.add(rect);
        stage.add(layerBall);
        mazeGame.time = new Date().getTime();
    }
    
    function mazeInitialize() {
        mazeGame.squares=[];
        mazeGame.vWalls=[];
        mazeGame.hWalls=[]
        for (var i=0;i<15;i++) {
            mazeGame.squares[i]=[];
            mazeGame.vWalls[i]=[];
            if (i<14) {
                mazeGame.hWalls[i] = [];
            }
            for (var j=0;j<15;j++) {
                mazeGame.squares[i][j] = false;
                if (i<14) {
                    mazeGame.hWalls[i][j] = true;
                }
                if (j<14) {
                    mazeGame.vWalls[i][j] = true;
                }
            }
        }
    }
    
    function mazeIterativeCreate(){
        while (mazeGame.path.length>0) {
            var square;
            var index;
            var options=[];
            var newPath;
            if (Math.random()>0.2){//Continue path
                index=mazeGame.path.length-1;
                
            } else { //New path
                index=Math.floor(Math.random()*mazeGame.path.length);                
            }
            square=mazeGame.path[index];
            mazeAdd(square[0]-1,square[1],square[0]-1,square[1],options,true);
            mazeAdd(square[0]+1,square[1],square[0],square[1],options,true);
            mazeAdd(square[0],square[1]-1,square[0],square[1]-1,options,false);
            mazeAdd(square[0],square[1]+1,square[0],square[1],options,false);
            if (options.length == 0) {
                mazeGame.path.splice(index, 1);
            } else {
                newPath=options[Math.floor(Math.random()*options.length)];
                mazeGame.squares[newPath[0]][newPath[1]]=true;
                if (newPath[4]) {
                    mazeGame.hWalls[newPath[2]][newPath[3]]=false;
                } else {
                    mazeGame.vWalls[newPath[2]][newPath[3]]=false;
                }                
                mazeGame.path.push([newPath[0],newPath[1]]);
            }
        }
    }
    
    function mazeAdd(x,y,wallx,wally,options,horizontal) {
        if (x>=0 && x<15 && y>=0 && y<15 && !mazeGame.squares[x][y]) {
            options.push([x,y,wallx,wally,horizontal]);
        }
    }
    
    function mazeDrawMaze() {
        for (var i=0;i<15;i++) {
            for (var j=0;j<15;j++) {
                if (i<14 && mazeGame.hWalls[i][j]) {
                    var line = new Kinetic.Line({
                        points: [25+30*(j),25+30*(i+1),25+30*(j+1),25+30*(i+1)],
                        stroke: 'black',
                        strokeWidth:2
                    });
                    stage.getLayers()[0].add(line);
                }
                if (j<14 && mazeGame.vWalls[i][j]) {
                    var line = new Kinetic.Line({
                        points: [25+30*(j+1),25+30*(i),25+30*(j+1),25+30*(i+1)],
                        stroke: 'black',
                        strokeWidth:2
                    });
                    stage.getLayers()[0].add(line);
                }
            }
        }
        stage.getLayers()[0].draw();
    }
    
    function mazeMakeTree() {
        mazeGame.root={
            node: [0,0],
            sons: []
        }
        mazeMakeTreeNode(mazeGame.root, null);        
    }
    
    function mazeMakeTreeNode(node, antNode) {
        //First create the sons
        var cell=node.node;
        mazeAddNode(node,cell[0]-1,cell[1], cell[0]-1,cell[1], true, antNode);
        mazeAddNode(node,cell[0]+1,cell[1], cell[0],cell[1], true,antNode);
        mazeAddNode(node,cell[0],cell[1]-1, cell[0],cell[1]-1,false, antNode);
        mazeAddNode(node,cell[0],cell[1]+1, cell[0],cell[1], false, antNode);
        var maxHeight=0;
        var maxHeightCell=[cell[0], cell[1]];
        var secondMaxHeight=0;
        var secondMaxHeightCell=[];
        var maxPath=0;
        var cellPathStart=[cell[0], cell[1]];
        var cellPathEnd=[cell[0], cell[1]];
        for (var i=0; i<node.sons.length; i++) {
            var height=node.sons[i].height;
            if (height>secondMaxHeight) {
                if (height>maxHeight) {
                    secondMaxHeight=maxHeight;
                    secondMaxHeightCell=maxHeightCell;
                    maxHeight=height;
                    maxHeightCell=node.sons[i].heightCell;
                } else {
                    secondMaxHeight=height;
                    secondMaxHeightCell=node.sons[i].heightCell;
                }
            }
            if (maxPath<node.sons[i].maxPath) {
                maxPath=node.sons[i].maxPath;
                cellPathStart=node.sons[i].cellPathStart;
                cellPathEnd=node.sons[i].cellPathEnd;
            }
        }
        node.height = maxHeight +1;
        node.heightCell = maxHeightCell;
        if (maxPath<maxHeight+secondMaxHeight) {
            maxPath=maxHeight+secondMaxHeight;
            cellPathStart=maxHeightCell;
            cellPathEnd=secondMaxHeightCell;
        }        
        node.maxPath=maxPath;
        node.cellPathStart=cellPathStart;
        node.cellPathEnd=cellPathEnd;
    }
    
    function mazeAddNode(node, x, y, wallx, wally, horizontal, antNode) {
        var cell=node.node;
        if (x>=0 && x<15 && y>=0 && y<15 && (!antNode || x!=antNode.node[0] || y!=antNode.node[1])) {
            if (horizontal) {
                if (!mazeGame.hWalls[wallx][wally]) {
                    node.sons.push({node:[x,y],sons:[]});
                    mazeMakeTreeNode(node.sons[node.sons.length-1],node);
                }
            } else {
                if (!mazeGame.vWalls[wallx][wally]) {
                    node.sons.push({node:[x,y],sons:[]});
                    mazeMakeTreeNode(node.sons[node.sons.length-1],node);
                }
            }
        }
    }
    
    function mazeBallIni() {
        mazeGame.ballMoving=true;
        mazeBallMove();
    }
    
    function mazeBallMove() {
        if (mazeGame.ballMoving) {
            var mousePosition=stage.getTouchPosition();
            if (!mousePosition) {
                mousePosition=stage.getMousePosition()
            }
            if (!mousePosition) {
                setTimeout(mazeBallMove,50);
                return;
            }
            if (Math.abs(mousePosition.x-mazeGame.circle.getX())>Math.abs(mousePosition.y-mazeGame.circle.getY())) {
                if (!mazeHorizontalMove(mousePosition)) {
                    if(!mazeVerticalMove(mousePosition)){
                        setTimeout(mazeBallMove,50);
                    }
                }
            }
            else{
                if (!mazeVerticalMove(mousePosition)) {
                    if(!mazeHorizontalMove(mousePosition)){
                        setTimeout(mazeBallMove,50);
                    }
                }
            }
        }
    }
    
    function mazeHorizontalMove(pos) {
        if (Math.abs(pos.x-mazeGame.circle.getX())<=15) {
            return false;
        }
        var posX=(mazeGame.circle.getX()-40)/30;
        var posY=(mazeGame.circle.getY()-40)/30;
        var endX;
        if (pos.x>mazeGame.circle.getX()) {
            if (posX>13 || mazeGame.vWalls[posY][posX]) {
                return false;
            } else {
                endX = posX+1;                
            }
        } else {
            if (posX<1 || mazeGame.vWalls[posY][posX-1]) {
                return false;
            } else {
                endX = posX-1;                
            }
        }
        anim=new Kinetic.Animation(function(frame) {
            if (frame.time < 200) {
                mazeGame.circle.setX(40+posX*30+(endX-posX)*frame.time*30/200);
            }else{        
                mazeGame.circle.setX(40+endX*30);
                anim.stop();
                if (endX==mazeGame.root.cellPathEnd[1] && posY==mazeGame.root.cellPathEnd[0]) {
                    mazeGameCompleted();
                } else {
                    mazeBallMove();
                }
            }
        }, stage.getLayers()[1]);
        anim.start();
        return true;
    }
    
    function mazeVerticalMove(pos) {
        if (Math.abs(pos.y-mazeGame.circle.getY())<=15) {
            return false;
        }
        var posX=(mazeGame.circle.getX()-40)/30;
        var posY=(mazeGame.circle.getY()-40)/30;
        var endY;
        if (pos.y>mazeGame.circle.getY()) {
            if (posY>13 || mazeGame.hWalls[posY][posX]) {
                return false;
            } else {
                endY = posY+1;                
            }
        } else {
            if (posY<1 || mazeGame.hWalls[posY-1][posX]) {
                return false;
            } else {
                endY = posY-1;                
            }
        }
        anim=new Kinetic.Animation(function(frame) {
            if (frame.time < 200) {
                mazeGame.circle.setY(40+posY*30+(endY-posY)*frame.time*30/200);
            }else{        
                mazeGame.circle.setY(40+endY*30);
                anim.stop();
                if (endY==mazeGame.root.cellPathEnd[0] && posX==mazeGame.root.cellPathEnd[1]) {
                    mazeGameCompleted();
                } else {
                    mazeBallMove();
                }
            }
        }, stage.getLayers()[1]);
        anim.start();
        return true;
    }
    
    function mazeBallEnd() {
        mazeGame.ballMoving=false;
    }
    
    function mazeGameCompleted() {
        mazeGame.time = new Date().getTime()-mazeGame.time;
        var star = mazeMedal();        
        var previousMedal=loadString("mazeMedal");
        var improved = false;        

        if (!loadString("mazeTime") || mazeGame.time < loadString("mazeTime")) {
            improved = true;
            storeString("mazeMedal", star);
            storeString("mazeTime", mazeGame.time);
        }
        animateStar(star, improved, "maze", mazeEndScreen);      
    }    
    
    function mazeMedal() {
        if (mazeGame.time <25000) {
            strImage="gold";
        } else if (mazeGame.time <35000) {
            strImage="silver";
        } else{
            strImage="bronze";
        }
        return strImage;
    }
    
    function mazeEndScreen() {
        $('#employment>img').css('opacity',0.2);
        stage.getLayers()[1].remove();
        stage.getLayers()[0].remove();
        var layer = backgroundLayer("#ccc");
        var text = createText(getCVTemplate(14)+": "+Math.round(mazeGame.time/10)/100, 0, 40, 500, 80);
        layer.add(text);
        var highscore = mazeGame.time;
        if (loadString("mazeTime") && mazeGame.time>parseInt(loadString("mazeTime"))) {
            highscore = loadString("mazeTime");
        }
        var bestText = createText(getCVTemplate(15)+": "+Math.round(highscore/10)/100, 0, 80, 500, 100);
        layer.add(bestText);
        var textBronze = createText("--.--", 50, 250, 100, 50);
        layer.add(textBronze);
        var textSilver = createText("35.00", 200, 250, 100, 50);
        layer.add(textSilver);
        var textGold = createText("25.00", 350, 250, 100, 50);
        layer.add(textGold);
        
        createImage(layer,"bronze-star.png", 50, 150, 100, 100, 1);
        if (highscore<20000) {
            createImage(layer,"silver-star.png", 200, 150, 100, 100, 1);
        } else{
            createImage(layer,"silver-star.png", 200, 150, 100, 100, 0.3);
        }
        if (highscore<10000) {
            createImage(layer,"gold-star.png", 350, 150, 100, 100, 1);
        } else {
            createImage(layer,"gold-star.png", 350, 150, 100, 100, 0.3);
        }          
        addPlayButton(layer, 100, 325, 100, 100, mazePlay);
        addCloseButton(layer, 300, 325, 100, 100);
        stage.add(layer);
    }
});