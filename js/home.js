let user = {
    firstName: "",
    lastName: "",
    labels: {
        labelName: ""
    },
    transactions: [],
};
async function fetchData() {
    const token = localStorage.getItem("token");

    try {
        const response = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query: `
                query {
                    user {
                        firstName
                        lastName
                        labels(limit:1) {
                            labelName
                        }
                        transactions(limit:7, order_by:[{type:desc}, {amount:desc}], distinct_on:[type], where:{type:{_like:"skill_%"}}) {
                            type
                            amount
                        }
            sum_greater_than_1: progresses_aggregate(
               where: { 
              _and: [
          { event: { object: { name: { _eq: "Module" } } } },
          { grade: { _gt: 1 } }
        ]
        }
            ) {
           aggregate {
             sum {
                grade
            } 
        }
     }
    
            sum_less_or_equal_1: progresses_aggregate(
                where: { 
            _and: [
                   { event: { object: { name: { _eq: "Module" } } } },
                   { grade: { _lte: 1 } }
                  ]
               }
            ) {
            aggregate {
             sum {
                grade
            }
         }  
      }
    }
        transaction_aggregate(where: {type: {_eq: "xp"}, event: {object: {type: {_eq: "module"}}}}) {
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
        return data;
    } catch (error) {
        console.error(error);
    }
}

async function home() {
    let data = await fetchData();
    user = data.data.user[0];
    console.log(user);
    document.getElementById("fillname").innerText = user.firstName + " " + user.lastName;
    document.getElementById("labels").innerText = user.labels[0].labelName;
    document.getElementById("xp").innerText = data.data.transaction_aggregate.aggregate.sum.amount;
    barsvg(user.transactions);
}

function barsvg(data) {
    const svg = document.getElementById("barChart");
    svg.innerHTML = ""; 
    const width = Math.min(window.innerWidth * 0.9, 500);
    const height = 300;
    const padding = 40;

    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const maxSkill = data.reduce((max, skill) => skill.amount > max.amount ? skill : max, data[0]);
    const barWidth = (width - 2 * padding) / data.length;
    const maxValue = maxSkill.amount;

    const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tooltip.setAttribute("font-size", "14");
    tooltip.setAttribute("fill", "red");
    tooltip.setAttribute("visibility", "hidden");
    tooltip.setAttribute("text-anchor", "middle");
    svg.appendChild(tooltip);

    data.forEach((value, index) => {
        const barHeight = (value.amount / maxValue) * (height - 2 * padding);
        const x = padding + index * barWidth;
        const y = height - padding - barHeight;
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth - 10);
        rect.setAttribute("height", barHeight);
        rect.setAttribute("fill", "blue");
        rect.style.cursor = "pointer";

        rect.addEventListener("click", () => {
            tooltip.textContent = data[index].type;
            tooltip.setAttribute("x", x + barWidth / 2 - 5);
            tooltip.setAttribute("y", y - 10);
            tooltip.setAttribute("visibility", "visible");
        });

        svg.appendChild(rect);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x + barWidth / 2 - 5);
        text.setAttribute("y", height - 10);
        text.setAttribute("font-size", "14");
        text.setAttribute("text-anchor", "middle");
        text.textContent = data[index].amount+"%";
        svg.appendChild(text);
    });
}

window.addEventListener("resize", () => {
    document.getElementById("barChart").innerHTML = "";
    barsvg(user.transactions);
});

home();
