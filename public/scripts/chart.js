const ctx = document.getElementById('avg-sat');
const ctx2 = document.getElementById('per-rec');
const ctx3 = document.getElementById('per-sen');
const ctx4 = document.getElementById('per-ur');
const ctx5 = document.getElementById('per-day');
const ctx6 = document.getElementById('per-month');
const btn = document.getElementById('show-graph');
const main_chart = document.getElementById('main-charts');

async function showVisualization(event) {
    const response = await fetch('/showVisualization');
    const resData = await response.json();

    let rec_type = [];
    let sat = [];
    let j = 0;
    for (var i of resData.avg_sat) {
        rec_type[j] = i.receiver_type;
        sat[j] = i.satisfaction;
        j++;
    }
    j = 0;
    let rec_type_counts = []
    let counts = []
    for (var i of resData.per_rec) {
        rec_type_counts[j] = i.receiver_type;
        counts[j] = i.counts;
        j++;
    }
    j = 0;
    let sen_type = []
    let sen_counts = []
    for (var i of resData.per_sen) {
        sen_type[j] = i.sender_type;
        sen_counts[j] = i.counts;
        j++;
    }
    j = 0;
    let urgency = [];
    let ur_counts = [];
    for (var i of resData.per_ur) {
        urgency[j] = i.urgency;
        ur_counts[j] = i.counts;
        j++;
    }
    j = 0;
    let days = [];
    let com = [];
    for (var i of resData.per_day) {
        days[j] = i.day;
        com[j] = i.queries_launched;
        j++;
    }
    j = 0;
    let months = [];
    let com_m = [];
    for (var i of resData.per_mon) {
        months[j] = i.month;
        com_m[j] = i.queries_launched;
        j++;
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: rec_type,
            datasets: [{
                label: 'Average satisfaction rate per category',
                data: sat,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                  beginAtZero: true
                }
              }
            } 
    })

    new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: rec_type_counts,
            datasets: [{
                label: 'Number of complaints received per category',
                data: counts,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                  beginAtZero: true
                }
              }
            } 
    })

    new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: sen_type,
            datasets: [{
                label: 'Number of complaints sent per category',
                data: sen_counts,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                  beginAtZero: true
                }
              }
            } 
    })

    new Chart(ctx4, {
        type: 'bar',
        data: {
            labels: urgency,
            datasets: [{
                label: 'Urgent vs Non-urgent complaints',
                data: ur_counts,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                  beginAtZero: true
                }
              }
            } 
    })

    new Chart(ctx5, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: 'Number of complaints per day for the last month',
                data: com,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                  beginAtZero: true
                }
              }
            } 
    })

    new Chart(ctx6, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Number of complaints per month for the last year',
                data: com_m,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                  beginAtZero: true
                }
              }
            } 
    })

    main_chart.style.display = 'grid';
    btn.style.display = 'none';
}

btn.addEventListener('click',showVisualization);

