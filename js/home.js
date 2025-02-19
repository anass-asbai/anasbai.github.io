let user = {
    firstName: "",
    lastName: "",
    labels: {
        labelName: ""
    },
    sum_greater_than_1: {
        aggregate: {
            sum: {
                grade: 0
            }
        },


    },
    sum_less_or_equal_1: {
        aggregate: {
            sum: {
                grade: 0
            }
        },
    },
    progresses: [{
        object: {
            name: "",
            createdAt: "",
        }
    }],
    transactions: [],
};
async function fetchData() {
    const token = localStorage.getItem("token");
    let data
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
    progresses(
      limit: 5
      order_by: [{ id: desc }]
      where: {
        _and: [
          { event: { object: { name: { _eq: "Module" } } } }
          { isDone: { _eq: true } }
        ]
      }
    ) {
      object {
        name
        createdAt
        
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
        data = await response.json();
    } catch (error) {
        window.location.href = "index.html"
        localStorage.clear();
        console.error(error);
    }
    if (!data.data){
        window.location.href = "index.html"
        localStorage.clear();
    }
    return data;

}

async function home() {
    let data = await fetchData();
    user = data.data.user[0];
    document.getElementById("fillname").innerText = user.firstName + " " + user.lastName;
    document.getElementById("labels").innerText = user.labels[0].labelName;
    document.getElementById("xp").innerText = data.data.transaction_aggregate.aggregate.sum.amount / 1000;
    logaut()
    lastpush(user.progresses)
    barsvg(user.transactions);
    drawChart(user.sum_greater_than_1.aggregate.sum.grade, user.sum_less_or_equal_1.aggregate.sum.grade)
}
function logaut() {
    document.getElementById("logaut").addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    })
}
function lastpush(data) {
    let lastpush = document.getElementById('lastpush')
    data.forEach((item) => {
        let projict = document.createElement('div')
        projict.classList.add('projict')
        projict.innerHTML = `
      <div class="projict__name">${item.object.name}</div>
      `
        lastpush.appendChild(projict)
    }
    )
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
        text.textContent = data[index].amount + "%";
        svg.appendChild(text);
    });
}

window.addEventListener("resize", () => {
    document.getElementById("barChart").innerHTML = "";
    barsvg(user.transactions);
});
function drawChart(passed, failed) {
    let total = passed + failed;
    let passedAngle = (passed / total) * Math.PI * 2;
    let svg = document.getElementById("chart");
    let centerX = 100, centerY = 100, radius = 100;

    function createPath(startAngle, endAngle, color) {
        let x1 = centerX + radius * Math.cos(startAngle);
        let y1 = centerY + radius * Math.sin(startAngle);
        let x2 = centerX + radius * Math.cos(endAngle);
        let y2 = centerY + radius * Math.sin(endAngle);

        let largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        let path = `M ${centerX},${centerY} L ${x1},${y1} A ${radius},${radius} 0 ${largeArc},1 ${x2},${y2} Z`;

        let pathElem = document.createElementNS("http://www.w3.org/2000/svg", "path");
        pathElem.setAttribute("d", path);
        pathElem.setAttribute("fill", color);
        svg.appendChild(pathElem);
    }
    let valid = (passed * 100) / total;
    let notvalid = (failed * 100) / total;
    document.getElementById('validcount').innerText = Math.floor(valid)
    document.getElementById('notvalid').innerText = Math.floor(notvalid)
    createPath(0, passedAngle, "green");
    createPath(passedAngle, Math.PI * 2, "red");
}

home();
