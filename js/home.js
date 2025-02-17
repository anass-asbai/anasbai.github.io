
let user = {
    firstName: "",
    lastName: "",
    labels:{
        labelName:""
    }
};
async function fetchData() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql'
            , {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    query: `
                    query {
                    user{
                       firstName
                       lastName
                         labels (limit:1),{
                             labelName
                          }
                    }
              transaction_aggregate(
                   where: {type: {_eq: "xp"}, event: {object: {type: {_eq: "module"}}}}
                   ) {
                  aggregate {
                sum {
                    amount
                }
           }
        }
                }`
                })
            });
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error(error);
    }
}
async function home(){
    let data= await fetchData();
    user=data.data.user[0]
    let firsName=document.getElementById("fillname")
    firsName.innerText=user.firstName+" "+user.lastName
    let labels=document.getElementById("labels")
    labels.innerText=user.labels[0].labelName
    let xp=document.getElementById("xp")
    xp.innerText=data.data.transaction_aggregate.aggregate.sum.amount
} 
home()