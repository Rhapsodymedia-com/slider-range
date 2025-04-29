var sliderPlugin = document.getElementById("ceros-slider-range-plugin");
var createSlider = (obj, sliderInfo) => {
    //creating div elements
    let divs = [];
    let classesNames = ['slider-container', 'controller-container', 'controller', 'arrows-container'];
    for(let i = 0; i<classesNames.length; i++){
        divs[i] = document.createElement("div");
        divs[i].classList.add(classesNames[i]);
        if(i==0){
            divs[i].id = "slider" + (sliderInfo.num).toString();
        }
    }
    //creating arrows
    let arrows = [];
    for(let x = 0; x<2;x++){
        arrows[x] = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        arrows[x].classList.add("arrows");
        arrows[x].setAttribute("viewBox", "0 0 100 100");
        document.body.append(arrows[x]);
        let arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        arrowPath.classList.add("arrow");
        arrowPath.setAttribute("d", sliderPlugin.getAttribute("arrows"));
        arrows[x].append(arrowPath);
        if(x==0){
            arrows[x].classList.add("left-arrow");
            continue;
        }
        if(x==1){
            arrows[x].classList.add("right-arrow");
            break;
        }
    }
    //creating input element
    var sliderRange = document.createElement('input');
    var inputAttrbutes = ['type', 'min', 'max', 'value', 'step', 'class', 'style'];
    var attributesProperty = ["range", "0", "100", "50", "any", "slider-range","width: 100%; height: 100%;"];
    for(let y = 0; y< inputAttrbutes.length; y++){
        sliderRange.setAttribute(inputAttrbutes[y], attributesProperty[y]);
    }
    //merging elements
    let o = document.getElementById(obj.id);
    o.append(divs[0]);
    divs[0].append(divs[1], sliderRange);
    divs[1].append(divs[2]);
    divs[2].append(divs[3]);
    divs[3].append(arrows[0], arrows[1]);
    return divs[0];
}

var controlSlider = (e, sliderInfo, sliderWid, pageCont) => {
    //defining images
    var beforeComponents = e.findLayersByTag('before' + sliderInfo.num).layers;
    var afterComponents = e.findLayersByTag('after' + sliderInfo.num).layers;
    var getChildren = (components) =>{
        let allChildren = [];
        for(let i = 0; i<components.length; i++){
            if(components[i].type==='group'){
                let allItems = components[i].items
                console.log(allItems)
                let lastElem = allItems[allItems.length-1]
                lastElem = e.findLayerById(lastElem.id)
                // lastElem = document.getElementById(lastElem.id)
                console.log(lastElem)
                let gr = document.getElementById(components[i].id)
                gr.style.width = `${lastElem.width}px`
                gr.style.height = `${lastElem.height}px`
                // gr.style.width = lastElem.style.width
                // gr.style.height = lastElem.style.height
                console.log(gr)
                allChildren.push(gr)
                break
            }
            // let isGroup = components[i].type==='group'
            let component = document.getElementById(components[i].id);
            let comp = $(component).children().toArray();
            allChildren[i] = comp;
        }
        return allChildren;
    }
    var beforeComps = getChildren(beforeComponents);
    var afterComps = getChildren(afterComponents);
    //defining variables of specific slider
    var sliderContainer = document.getElementById('slider' + sliderInfo.num);
    var slider = sliderContainer.querySelector('input');
    var controllerContainer = sliderContainer.querySelector('.controller-container');
    var controller = controllerContainer.querySelector('.controller');
    var val = slider.getAttribute("value");
    var margins = 0;

    if(sliderInfo.follow=='false'){
        slider.addEventListener("input", sliderMove);
    }
    else{
        slider.addEventListener("mousemove", sliderMove);
        slider.addEventListener("mouseleave", sliderMove);
    }

    let clipPathFunction = (arr, v) =>{
        let inset = ('inset(' + v.toString() + ')');
        for(let ar of arr){
            ar.style.animation = null;
            ar.style.setProperty('-webkit-clip-path', inset.toString());
            ar.style.setProperty('clip-path', inset.toString());
        }
    }
    function sliderMove($this){
        if(controllerContainer.style.animation != null){
            controllerContainer.style.animation = null;
        }
        if(sliderInfo.follow == 'false'){
            val = slider.value;
        }
        else{
            //proportion
            let viewportWidth = $(pageCont).parent().width();
            let windowWidth = window.innerWidth;
            let proportion = windowWidth/viewportWidth;
            //margins
            let pageLeftMargin = Math.ceil(parseFloat(pageCont.querySelector(".page-scroll").style.left));

            let sliderParentLeft = parseFloat($(sliderContainer).parent().css("left"));
            let newVal = ((($this.clientX/proportion)-sliderParentLeft-pageLeftMargin)/Math.ceil($(sliderContainer).width()))*100;
            let oldVal = val;
            val = (newVal<=100 && newVal>=0) ? newVal : oldVal;
        }
        if(val >= margins && val <= (100 - margins)){
            controllerContainer.style.left = val + '%';
            for(let before of beforeComps){
                clipPathFunction(before, ('0% ' + (100-val) + '% 0% 0%'));
            }for(let after of afterComps){
                clipPathFunction(after, ('0% 0% 0% ' + val + '%'));
            }
        }
        else if(val < margins){
            controllerContainer.style.left = (margins + '%');
            for(let before of beforeComps){
                clipPathFunction(before, ('0% ' + (100-margins) + '% 0% 0%'));
            }for(let after of afterComps){
                clipPathFunction(after, ('0% 0% 0% ' + margins + '%'));
            }
        }
        else{
            controllerContainer.style.left = ((100 - margins) + '%');
            for(let before of beforeComps){
                clipPathFunction(before, ('0% ' + margins + '% 0% 0%'));
            }for(let after of afterComps){
                clipPathFunction(after, ('0% 0% 0% ' + (100-margins) + '%'));
            }
        }
    };

    var localInitialFunction = () => {
        /* basics settings */
        controllerContainer.style.left = val + '%';
        for(let before of beforeComps){
            clipPathFunction(before, ('0% 50% 0% 0%'));
        }for(let after of afterComps){
            clipPathFunction(after, ('0% 0% 0% 50%'));
        }
        /* optional settings */
        if(sliderInfo.playAnim=='true'){
            controllerContainer.style.animation = 'sliderMove ' + sliderInfo.animType;
            let styleFunction = (arr, animName) =>{
                for(let ar of arr){
                    ar.style.setProperty('animation', animName + sliderInfo.animType);
                }
            }
            for(let before of beforeComps){
                styleFunction(before, 'compAnimBefore ');
            }for(let after of afterComps){
                styleFunction(after, 'compAnimAfter ');
            }
        }
        controllerContainer.style.width = sliderInfo.lineSize + 'px';
        controllerContainer.style.setProperty("margin-left", ((sliderInfo.lineSize*(-0.5)) + 'px'));
        if(sliderInfo.hideCta=='true'){
            controller.style.opacity = 0;
        }
        controller.style.transform = 'scale(' + sliderInfo.ctaScale + ')';
        if(sliderInfo.setMargin=='true'){
            margins = ((($(controller).width()*parseFloat(sliderInfo.ctaScale))/2)*100)/sliderWid;
        }
    }
    localInitialFunction();
}

(function(){
    'use strict';
    require.config({
        paths: {
            CerosSDK: '//sdk.ceros.com/standalone-player-sdk-v5.min'
        }
    });
    require(['CerosSDK'], function (CerosSDK) {
        CerosSDK.findExperience()
            .fail(function (error) {
                console.error(error);
            })
            .done(function (experience) {
                window.myExperience = experience;
                var sliderObjects = experience.findLayersByTag("slider-range").layers;

                experience.on(CerosSDK.EVENTS.PAGE_CHANGED, pageChangedCallback);
                function pageChangedCallback(){
                    var pageContainer = document.querySelector(".page-viewport.top > .page-container");
                    //making new array of sliderObjects that are on current page 
                    var currentPageSliderObjects = sliderObjects.filter(($object) =>{
                        let $obj = document.getElementById($object.id);
                        if(pageContainer.contains($obj)){
                            if($obj.querySelector('.slider-container')){
                                return;
                            }
                            return $object;
                        }
                    });
                    setSliders(currentPageSliderObjects, experience, pageContainer);
                }
            })
    });
})();

class sliderInformations{
    constructor(num, playAnim, animType, follow, hideCta, ctaScale, setMargin, lineSize){
        this.num = num;
        this.playAnim = playAnim;
        this.animType = animType;
        this.follow = follow;
        this.hideCta = hideCta;
        this.ctaScale = ctaScale;
        this.setMargin = setMargin;
        this.lineSize = lineSize;
    }
}
var setSliders = (sliders, exp, pageContainer) => {
    var info = [];
    for(let i = 0;i<sliders.length;i++){
        var sliderWidth = sliders[i].getWidth();
        var tags = sliders[i].getTags();
        var number = i +1;
        var playAnimation = sliderPlugin.getAttribute("play-animation");
        var animationType = sliderPlugin.getAttribute("animation-type");
        var followCursor = sliderPlugin.getAttribute("follow-cursor");
        var hideButton = sliderPlugin.getAttribute("hide-button");
        var buttonScale = parseFloat(sliderPlugin.getAttribute("button-scale"));
        var setMargins = sliderPlugin.getAttribute("set-margins");
        var lineWidth = parseFloat(sliderPlugin.getAttribute("line-width"));

        _.forEach(tags, function(value, key){
            if(value.indexOf("slider:") > -1){
                let sliderNumber = value.slice(7, value.length);
                number = parseInt(sliderNumber);
            }
            if(value.indexOf("play-animation") > -1){
                playAnimation = 'true';
            }
            if(value.indexOf("anim:") > -1){
                let a = value.slice(5, value.length).toString();
                animationType = a.replaceAll("-", " ");
            }
            if(value.indexOf("follow") > -1){
                followCursor = 'true';
            }
            if(value.indexOf("hide-button") > -1){
                hideButton = 'true';
            }
            if(value.indexOf("button-scale:") > -1){
                let cta = value.slice(13, value.length).toString();
                buttonScale = cta;
            }
            if(value.indexOf("set-margins") > -1){
                setMargins = 'true';
            }
            if(value.indexOf("line-width:") > -1){
                let line = value.slice(11, value.length).toString();
                lineWidth = parseFloat(line);
            }
        });
        info[i] = new sliderInformations(number, playAnimation, animationType, followCursor, hideButton, buttonScale, setMargins, lineWidth);
        createSlider(sliders[i], info[i]);
        controlSlider(exp, info[i], sliderWidth, pageContainer);
    }
}
