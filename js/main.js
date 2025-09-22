import { ImageData } from './Image.js';
const constraints = {
    video: {
        width: { ideal: 400 },
        height: { ideal: 480 },
        facingMode: { exact: "environment" }
    }
};

const myVideo = document.querySelector('#myVideo');
const myCanvas = document.querySelector('#myCanvas');
let stream = null;


let map = L.map('map').setView([51.505, -0.09], 13);

document.querySelector('#takePhoto').addEventListener('click', takePhoto);
document.querySelector('#stopCamera').addEventListener('click', stopCamera);

document.querySelector('input').addEventListener('input', event => {
    if (event.target.value.trim() !== "") {
        document.querySelector('#takePhoto').disabled = false;
    }
    else {
        document.querySelector('#takePhoto').disabled = true;
    }
});

map.on('click', onMapClick);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    .openPopup();


afficherImage();

function onMapClick(e) {
    L.marker(e.latlng).addTo(map)
        .bindPopup("<div id='affichageDemande'>Ajouter une cachette ici ? <button id='startCamera' class='btn btn-success col-5 m-2'>Ajouter</button></div>")
        .openPopup();
    document.querySelector('#startCamera').addEventListener('click', startCamera);
}

function startCamera() {
    if (stream) return;
    navigator.mediaDevices.getUserMedia(constraints)
        .then(s => {
            document.querySelector("input").className = "";
            document.querySelector("video").className = "";
            document.querySelector("#containerButtons").className = "row";
            stream = s;
            myVideo.srcObject = stream;
            myVideo.play();
        })
        .catch(error => {
            console.error('Erreur d’accès à la caméra:', error);
        });
}

// Prend une photo
function takePhoto() {
    if (!stream) return;
    const ctx = myCanvas.getContext('2d');

    myCanvas.width = 320;
    myCanvas.height = 240;
    ctx.drawImage(myVideo, 0, 0, myCanvas.width, myCanvas.height);

    const imageData = myCanvas.toDataURL("image/jpeg", 0.7);

    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

    let tableau = JSON.parse(localStorage.getItem("listePhotos") || "[]");

    const description = document.querySelector('#description').value || "";
    const photo = new ImageData(description, imageData);
    tableau.push(photo);
    localStorage.setItem("listePhotos", JSON.stringify(tableau));


    document.querySelector("input").className = "noDisplay";
    document.querySelector("video").className = "noDisplay";
    document.querySelector("#containerButtons").className = "row noDisplay";

}

function afficherImage() {
    let container = document.querySelector('#imageContainer');
    container.innerHTML = "";
    let tableau = JSON.parse(localStorage.getItem("listePhotos") || "[]");
    // tableau.forEach(photo => {
    //     container.innerHTML += `<div class="col-4" style="display:inline-block; text-align:center; margin:5px;">
    //                             <img src="${photo.data}" style="max-width:100px;">
    //                             <div>${photo.desc}</div>
    //                         </div>`;
    // });

}
// Arrête la caméra
function stopCamera() {
    if (stream) {
        document.querySelector("input").className = "noDisplay";
        document.querySelector("video").className = "noDisplay";
        document.querySelector("#containerButtons").className = "row noDisplay";
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        myVideo.srcObject = null;
    }
}