let Sineup = document.querySelector("#sineup")
Sineup.addEventListener("click", function () {
    let email = document.querySelector("#email").value
    let password = document.querySelector("#password").value
    let token = btoa(email + ':' + password);
    fetchData(token)
}
)
async function fetchData(token) {

    try {
        const response = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + token
            },
        });
        const data = await response.json();
        console.log(data )

        if (response.ok) {
            localStorage.setItem("token", data)
            window.location.href = "home.html"
        }

    } catch (error) {
        console.error(error);
    }


}

