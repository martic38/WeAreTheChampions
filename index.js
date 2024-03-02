import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, remove, runTransaction, orderByChild } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

// Configuring Firebase
const firebaseConfig = {
    databaseURL: "https://wearethechampions-a4f0d-default-rtdb.firebaseio.com/"
}

// DB Init
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsementList")

// HTML Init
let publishBtnEl = document.getElementById("publish-btn")
let inputFieldEl = document.getElementById("input-field")
let fromEl = document.getElementById("from-el")
let toEl = document.getElementById("to-el")
let endorsementContainerEl = document.getElementById("endorsement-container")

//ocalstorage Init
let likedIDsByApp = []
if (JSON.parse(localStorage.getItem("likedIDs"))) {
    likedIDsByApp = JSON.parse(localStorage.getItem("likedIDs"))
    
}


//listen for clicks on Publish button
publishBtnEl.addEventListener('click', addEndorsement)

//listen for clicks on like buttons
document.addEventListener("click", function(e){
    const target = e.target.closest(".likeEl"); // Or any other selector.
    let currentLikeBtn = target.id
    if(target){
      let exactLocationOfItemInDB = ref(database, `endorsementList/${currentLikeBtn}`)
      
      // DB transaction
      runTransaction(exactLocationOfItemInDB, (endorseObject) => {
            
            // if(endorseObject) {
            //     if (endorseObject.likeCount) {
            //         endorseObject.likeCount--
                    
            //     } else {
            //         endorseObject.likeCount++
            //         if (!endorseObject.likeCount) {
            //             endorseObject.likeCount = {}
            //         }
                
            //     }
            // }
            if (validateLike(currentLikeBtn)) {
                endorseObject.likeCount--
                let indexOfLikedEndorsement = likedIDsByApp.indexOf(currentLikeBtn)
                likedIDsByApp.splice(indexOfLikedEndorsement, 1)
                console.log("CANNY LIKE ANYMORE")
            } else {
                endorseObject.likeCount++
                likedIDsByApp.push(currentLikeBtn)
            }
            localStorage.setItem("likedIDs", JSON.stringify(likedIDsByApp))
        return endorseObject
      })
    }
  });
   
function validateLike(endorsementID) {
    if (likedIDsByApp) {
        return likedIDsByApp.includes(endorsementID)
    } else {
            return false
    }
}

function addEndorsement() {

    let endorsementComment = inputFieldEl.value
    let fromVal = fromEl.value
    let toVal = toEl.value

    if (endorsementComment === '' || fromVal === '' || toVal === ''){
        alert('Please fill out all input fields before publishing');
    } else {
            let newEntryArray = {
            comment: endorsementComment, 
            from: fromVal, 
            to: toVal, 
            likeCount: 0,
            timeStamp: Date.now()
            }
            
            push(endorsementsInDB, newEntryArray)
        }
    clearInputField()
}

function clearInputField(){
    inputFieldEl.value = ""
    fromEl.value = ""
    toEl.value = ""
}

function clearEndorsementContainer() {
    endorsementContainerEl.innerHTML = ""
}

function appendEndorsements(endorsement) {
    let newEl = document.createElement("div")
    newEl.setAttribute("id", "endorse-box")

    let endorseCommentValue = endorsement[1].comment
    let toValue = endorsement[1].to
    let fromValue = endorsement[1].from
    let likeCount = endorsement[1].likeCount
    let endorseID = endorsement[0]

    newEl.innerHTML = `
    <h4>To ${toValue}</h4>
    <p>${endorseCommentValue}</p>
    <h4 style="text-align:left;float:left;">From ${fromValue}</h4>
    <button style="text-align:right;float:right;" class="likeEl" id="${endorseID}">♥${likeCount}</button>`
    
    endorsementContainerEl.append(newEl)
}

//if  any change to the DB happens
onValue(endorsementsInDB, function(snapshot){
//grab all entries
    clearEndorsementContainer()
    let endorsementsArray = Object.entries(snapshot.val()).reverse()
    for (let i=0; i < endorsementsArray.length ; i++){
            let currentEndorsement = endorsementsArray[i]
            appendEndorsements(currentEndorsement)
        }

})


