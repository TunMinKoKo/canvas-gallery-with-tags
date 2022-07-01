//window.localStorage.clear()
var images_collection = JSON.parse(localStorage.getItem("imageCollection")) || [];
var c = document.getElementById('sliderCanvas');
var ctx = c.getContext('2d');
var image_index = 0;
var current_image_no = 1;
var total_image = 0;
var thumbnails_list = document.getElementById('thumbnails-list');
var img_name = document.getElementById('img-name');
var img_list_count = document.getElementById('img-list-nav');
var saved_tags = document.getElementById('saved-tags');
var images = [];
var selected_rect = -1;
var offsetX = c.offsetLeft;
var offsetY = c.offsetTop;
var startX;
var startY;

var drag = false;
var draw_done = false;
var m = {};
var o = {};
var start_position = {};

let set_image_caption = (image_index, current_image_no) => {
    img_name.innerHTML = images_collection[image_index].Filename;
    img_list_count.innerHTML = current_image_no + ' of ' + total_image;
}

let set_thumbnails = () => {
    document.querySelectorAll(".thumbnails-wrapper img")
        .forEach(img => img.remove());
    for (var i = 0; i < images_collection.length; i++) {
        let thumbnail = document.createElement('img');
        thumbnail.className = "thumbnail-img";
        thumbnail.setAttribute("onclick", "thumbnail_onclick("+i+")");
        thumbnail.src = images_collection[i].Data;
        thumbnail.width = 50;
        thumbnail.height = 50;
        thumbnails_list.appendChild(thumbnail);
    }
}

let thumbnail_onclick = (i) => {
    image_index = i ;
    current_image_no = image_index + 1;
    draw_image(image_index);
    draw_text();
    draw_existing_rect();
    set_text();
    set_image_caption(image_index, current_image_no);
}

let add_image = (image) => {
    let img = new Image();
    img.src = image.Data;
    img.onload = function() {
        draw_image(0);
        draw_text();
        set_text();
    }
    images_collection.push(image);
    images.push(img);
    window.localStorage.setItem("imageCollection",JSON.stringify(images_collection))
    current_image_no = 1; //Default
    set_image_caption(image_index, current_image_no);
}

let draw_next_image = () => {
    image_index++;
    if (image_index==images.length) {
        image_index=0;
        current_image_no = 0 ;
    }
    if(images.length > 1 ){
        current_image_no = current_image_no + 1;
        draw_image(image_index);
        set_image_caption(image_index, current_image_no);
        draw_text();
        draw_existing_rect();
        set_text();
    }
}

let draw_prev_image = () => {
    image_index--;
    
    if (image_index < 0) {
        image_index = images.length - 1;
        current_image_no = images.length + 1 ;
    }

    if(images.length > 1 ){
        current_image_no = current_image_no - 1;
        draw_image(image_index);
        set_image_caption(image_index, current_image_no);
        draw_text();
        draw_existing_rect();
        set_text();
    }
}

let delete_image = () => {
    images.splice(image_index, 1);
    images_collection.splice(image_index, 1);
    window.localStorage.setItem("imageCollection",JSON.stringify(images_collection))
    total_image = total_image - 1;
    image_index = 0;
    current_image_no = 1;
    set_image_caption(image_index, current_image_no);
    draw_image(image_index);
    set_thumbnails();
    set_text();
    draw_text();
    draw_existing_rect();
}

const file_input = document.getElementById("fileinput")
file_input.addEventListener('change', (e) => {
    for (let i = 0; i < file_input.files.length; i++) {
    const file = file_input.files[i];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = function (e) {     
    const splits = file.name.split(".");
    const fileJSON = { 
        "Filename": splits[0], 
        "Extension": splits[1], 
        "Data": reader.result, 
        "Tags":[]
    };
    
        add_image(fileJSON)
        set_thumbnails();
    }
    }
    
    total_image = total_image + file_input.files.length;
    file_input.value = "";
});


let redraw_rect = () => {  
    o.x = start_position.x;  // start position of x
    o.y = start_position.y;  // start position of y
    o.w = m.x - start_position.x;  // width
    o.h = m.y - start_position.y;  // height
    draw_existing_rect();
    draw_rect(o);
}

let draw_existing_rect = () => {
    let tags = images_collection[image_index].Tags;
    ctx.clearRect(0, 0, c.width, c.height);
    draw_image(image_index);
    tags.map(tag => {draw_rect(tag),draw_text()})
}

let draw_rect = (o) => {
    ctx.strokeStyle = "limegreen";
    ctx.lineWidth = 2;
    ctx.strokeRect(o.x,o.y,o.w,o.h);
}

let rect_hit = (isMobile, x, y, textIndex) => {
    let tags = images_collection[image_index].Tags;
    var rect = tags[textIndex];
    console.log("send para",x,y);
    console.log("Rect",rect);
    console.log(x >= rect.x);
    console.log(x <= rect.w + rect.x);
    console.log(y <= rect.h + rect.y);
    console.log(y >= rect.y);
    if (isMobile){
        console.log("Mobile");
        return (x >= rect.x && x <= rect.x + rect.w  && y <= rect.h + rect.y && y >= rect.y);
    }else{
        return (x >= rect.x && x <= rect.x + rect.w && y <= rect.y + rect.h && y >= rect.y);
    }
    
}

let handleMouseDown = (e , isMobile) => {
    let tags = images_collection[image_index].Tags;
    e.preventDefault();
    if(isMobile){
        var touch = e.targetTouches[0];
        let rect = c.getBoundingClientRect(), 
        scaleX = c.width / rect.width,  
        scaleY = c.height / rect.height; 
        startX = parseInt(touch.pageX - offsetX) * scaleX;
        startY = parseInt(touch.pageY - offsetY) * scaleY;
    }else{
        let rect = c.getBoundingClientRect(), 
        scaleX = c.width / rect.width,  
        scaleY = c.height / rect.height; 
        startX = parseInt(e.clientX - offsetX) * scaleX;
        startY = parseInt(e.clientY - offsetY) * scaleY;
    }
    start_position.x = startX;
    start_position.y = startY;

    drag = true;
    for (var i = 0; i < tags.length; i++) {
        if (rect_hit(isMobile, startX, startY, i)) {
            selected_rect = i;
        }
    }
}

let handleMouseUp = (e , isMobile) => {
    let tags = images_collection[image_index].Tags;
    e.preventDefault();
    drag = false;
    selected_rect = -1;
    if(draw_done){
        if(o.w < 100 && o.h < 100){
            alert("Please draw a bigger box.");
            draw_existing_rect();
        }else{
            let text = prompt("Please enter the tag name");
            if(text === null){
                draw_existing_rect();
                m = {};
                o = {};
                start_position = {};
            }else{
                o.text = text;
                tags.push(o);
                draw_existing_rect();
                set_text();
                window.localStorage.setItem("imageCollection",JSON.stringify(images_collection))
                m = {};
                o = {};
                start_position = {};
            }
        }
    }

}

let handleMouseMove = (e, isMobile) => {
    let tags = images_collection[image_index].Tags;
    if (selected_rect < 0) {
        if(isMobile){
            var touch = event.targetTouches[0];
            let rect = c.getBoundingClientRect(), 
            scaleX = c.width / rect.width,  
            scaleY = c.height / rect.height; 
            startX = parseInt(touch.pageX - offsetX) * scaleX;
            startY = parseInt(touch.pageY - offsetY) * scaleY;
        }else{
            let rect = c.getBoundingClientRect(), 
            scaleX = c.width / rect.width,  
            scaleY = c.height / rect.height; 
            startX = parseInt(e.clientX - offsetX) * scaleX;
            startY = parseInt(e.clientY - offsetY) * scaleY;
        }
        if(drag){
            m.x = startX;
            m.y = startY;       
            redraw_rect();
            draw_done = true;
        }
    }else{
        if(isMobile){
            var touch = event.targetTouches[0];
            let rect = c.getBoundingClientRect(), 
            scaleX = c.width / rect.width,  
            scaleY = c.height / rect.height; 
            mouseX = parseInt(touch.pageX - offsetX)* scaleX;
            mouseY = parseInt(touch.pageY - offsetY)* scaleY;
        }else{
            let rect = c.getBoundingClientRect(),
            scaleX = c.width / rect.width,  
            scaleY = c.height / rect.height; 
            mouseX = parseInt(e.pageX - offsetX)* scaleX;
            mouseY = parseInt(e.pageY - offsetY)* scaleY;
        }

        var dx = mouseX-startX;
        var dy = mouseY-startY;

        startX = mouseX;
        startY = mouseY;

        let rect = tags[selected_rect];
        rect.x += dx;
        rect.y += dy;

        draw_image(image_index);
        draw_existing_rect();
        drag = false;
        draw_done = false;
        window.localStorage.setItem("imageCollection",JSON.stringify(images_collection))
    } 
}

let handleMouseOut = (e) => {
    e.preventDefault();
    selected_rect = -1;
    drag = false;
    draw_done = false;
}

let draw_text = () => {
    let tags = images_collection[image_index].Tags;
    for (var i = 0; i < tags.length; i++) {
        ctx.font = "16px verdana";
        ctx.fillText(tags[i].text, tags[i].x + 5, tags[i].y + 16);
    }
}

let set_text = () => {
    let tags = images_collection[image_index].Tags;
    saved_tags.innerHTML = "";
    for (var i = 0; i < tags.length; i++) {
        let list = document.createElement('li');
        let delete_text_btn = document.createElement('button');
        delete_text_btn.innerHTML = "Delete";
        delete_text_btn.setAttribute("onclick", "delete_text("+i+")");
        delete_text_btn.className = "single-delete-btn";
        list.innerHTML = tags[i].text;
        list.appendChild(delete_text_btn);
        saved_tags.appendChild(list);
    }
    
}

let delete_text = (tag_index) => {
    let tags = images_collection[image_index].Tags;
    tags.splice(tag_index, 1);
    window.localStorage.setItem("imageCollection",JSON.stringify(images_collection));
    set_text();
    draw_image(image_index);
    draw_text();
    draw_existing_rect();
}

let delete_all_tags = () => {
    images_collection[image_index].Tags = [];
    window.localStorage.setItem("imageCollection",JSON.stringify(images_collection));
    set_text();
    draw_image(image_index);
    draw_text();
    draw_existing_rect();
}

let init_images = () => {
    if(images_collection.length < 1 ) {
        img_name.innerHTML = "Please upload an image to start.";
        img_list_count.innerHTML = "";
    }

    for( i = 0 ; i < images_collection.length ; i++){
        let img = new Image();
            img.src = images_collection[i].Data
            img.onload = () => {
                    if(images != []){
                        draw_image(image_index);
                        draw_text();
                        draw_existing_rect();
                    }  
            }
        images.push(img);
    }
    set_text();
    total_image = total_image + images_collection.length;

    set_image_caption(0, current_image_no);
    set_thumbnails();

}

let draw_image = (image_index) => {
    if(images != []){
        let image_width = images[image_index].width;
        let image_height = images[image_index].height;
        let ratio = image_width / image_height;
        let new_image_width = c.width;
        let new_image_height = new_image_width / ratio;
        if (new_image_height > c.height){
            new_image_height = c.height;
            new_image_width = new_image_height * ratio;
        }
        ctx.clearRect(0,0,c.width,c.height);
        ctx.drawImage(images[image_index],
        (c.width - new_image_width)/2,
        (c.height - new_image_height)/2,
        new_image_width,
        new_image_height
        );
    }
}

if (localStorage.getItem("imageCollection") !== null) {
    init_images();
}

function touchHandler(event) {
    if (event.targetTouches.length == 1) { //one finger touche
      var touch = event.targetTouches[0];
  
      if (event.type == "touchstart") {
        rect.startX = touch.pageX;
        rect.startY = touch.pageY;
        drag = true;
      } else if (event.type == "touchmove") {
        if (drag) {
          rect.w = touch.pageX - rect.startX;
          rect.h = touch.pageY - rect.startY ;
          draw_rect();
        }
      } else if (event.type == "touchend" || event.type == "touchcancel") {
        drag = false;
      }
    }
  }

c.addEventListener("mousedown", function(e){
    handleMouseDown(e ,false);
});

c.addEventListener("mousemove", function(e){
    handleMouseMove(e , false);
});

c.addEventListener("mouseup", function(e){
    handleMouseUp(e , false);
});

c.addEventListener("mouseout", function(e){
    handleMouseOut(e, false);
});

c.addEventListener("touchstart", function(e){
    handleMouseDown(e ,true);
});

c.addEventListener("touchmove", function(e){
    handleMouseMove(e, true);
});

c.addEventListener("touchend", function(e){
    handleMouseUp(e , true);
});

c.addEventListener("touchcancel", function(e){
    handleMouseOut(e, true);
});