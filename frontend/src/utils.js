let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let days = ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"];

const popUpSetUp = () => {
    popUp.style.display = "block";
    const popUpTitle = document.getElementById('popUpTitle')
    popUpTitle.textContent = ''
    const popUpBody = document.getElementById('popUpBody');
    popUpBody.textContent = "";

    return [popUpTitle, popUpBody]
}




const getTime = (time) => {
    const date = new Date(time);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDay();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return`${year} ${months[month]} ${days[day]} ${hour}:${minute}`

}


export { popUpSetUp, getTime }