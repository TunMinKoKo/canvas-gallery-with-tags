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
var selectedText = -1;
var offsetX = c.offsetLeft;
var offsetY = c.offsetTop;
var startX;
var startY;

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

let textHittest = (x, y, textIndex) => {
    let tags = images_collection[image_index].Tags;
    var text = tags[textIndex];
    return (x >= text.x && x <= text.x + text.width && y >= text.y - text.height && y <= text.y);
}

let handleMouseDown = (e) => {
    let tags = images_collection[image_index].Tags;
    e.preventDefault();
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    for (var i = 0; i < tags.length; i++) {
        if (textHittest(startX, startY, i)) {
            selectedText = i;
        }
    }
}

let handleMouseUp = (e) => {
    e.preventDefault();
    selectedText = -1;
}

let handleMouseOut = (e) => {
    e.preventDefault();
    selectedText = -1;
}

let handleMouseMove = (e) => {
    let tags = images_collection[image_index].Tags;
    if (selectedText < 0) {
        return;
    }
    e.preventDefault();
    mouseX = parseInt(e.clientX - offsetX);
    mouseY = parseInt(e.clientY - offsetY);

    var dx = mouseX - startX;
    var dy = mouseY - startY;
    startX = mouseX;
    startY = mouseY;

    var text = tags[selectedText];
    text.x += dx;
    text.y += dy;
    draw_image(image_index);
    draw_text();
    window.localStorage.setItem("imageCollection",JSON.stringify(images_collection))
    
}

let draw_text = () => {
    let tags = images_collection[image_index].Tags;
    for (var i = 0; i < tags.length; i++) {
        ctx.font = "16px verdana";
        ctx.fillText(tags[i].text, tags[i].x, tags[i].y, tags[i].width, tags[i].height);
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
}

let delete_all_tags = () => {
    images_collection[image_index].Tags = [];
    window.localStorage.setItem("imageCollection",JSON.stringify(images_collection));
    set_text();
    draw_image(image_index);
    draw_text();
}

const enter_tags = document.getElementById("enterTags");
enter_tags.addEventListener('keypress', (e) => {
    if(e.keyCode == 13){
        let text_y = images_collection[image_index].Tags.length * 20 + 20
        let text = {
            text : enter_tags.value,
            x : 20,
            y : text_y
        }

        ctx.font = "16px verdana";
        text.width = ctx.measureText(text.text).width;
        text.height = 16;

        images_collection[image_index].Tags.push(text);
        enter_tags.value = "";
        draw_text();
        set_text();
        window.localStorage.setItem("imageCollection",JSON.stringify(images_collection))

    }else{
        return false
    }
})

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
        let image_height = images[image_index].width;
        if(image_width >= c.width || image_height >= c.height){
            image_width = image_width * 0.7;
            image_height = image_height * 0.7;
        }
        ctx.clearRect(0,0,c.width,c.height);
        ctx.drawImage(images[image_index],
        (c.width - image_width)/2,
        (c.height - image_height)/2,
        image_width,
        image_height
        );
    }
}

if (localStorage.getItem("imageCollection") !== null) {
    init_images()
}

c.addEventListener("mousedown", function(e){
    handleMouseDown(e);
});

c.addEventListener("mousemove", function(e){
    handleMouseMove(e);
});

c.addEventListener("mouseup", function(e){
    handleMouseUp(e);
});

c.addEventListener("mouseout", function(e){
    handleMouseOut(e);
});