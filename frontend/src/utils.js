let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];


//Pop up related functions
const popUpSetUp = () => {
    popUp.style.display = "block";
    const popUpTitle = document.getElementById('popUpTitle')
    popUpTitle.textContent = ''
    const popUpBody = document.getElementById('popUpBody');
    popUpBody.textContent = "";

    return [popUpTitle, popUpBody]
}

//Pop up error messagings
const placeAlert = (infoToPlace) => {
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpBody.insertAdjacentText('afterbegin', infoToPlace);
}

const closePopUp = document.getElementById('closePopUp');
closePopUp.addEventListener('click', () => {
    popUp.style.display = "none";
})

// function used to obtain the time in a accesible format
const getTime = (time) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return`${year} ${months[month]} ${days[day]} ${hour}:${minute}`

}

// used to sort the name list when inviting them to a channel
function compareNames( a, b ) {
    if ( a.userName.toLowerCase() < b.userName.toLowerCase() ){
      return -1;
    }
    if ( a.userName.toLowerCase() > b.userName.toLowerCase() ){
      return 1;
    }
    return 0;
  }

export { popUpSetUp, getTime, compareNames, closePopUp, placeAlert }