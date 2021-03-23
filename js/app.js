// ***********************************************************
//      Setting Up Constants and Variables
// ***********************************************************

/* <-----  Testing for JS Connection with Index Page  -----> */
const log = console.log;
log('JS is connected');


/* <-----  API Url Constants  -----> */
const jobsApiUrl = '/jobs';
const wagesApiUrl = '/wages';
const blogsApiUrl = '/blogs';
const singleBlogApiUrl = '/blogs/blog';
const jobCategoryApiUrl = '/jobCategoryList';
const defaultHomeDataUrl = '/defaultHomeDataUrl';


/* <-----  Value Constants  -----> */
const defaultProfessionId = 1;  //  No longer used as default data for home page was changed 
const mapOptions = {
    center: { lat: 60.2971469, lng: -97.4133973 }, // Centre for Canada
    zoom: 3.2,
    minZoom: 3.2,
    maxZoom: 8
}
const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]


/* <-----  Below code was a try to solve an issue related to 
'Access Control Allow Origin' header which was later solved on server side   -----> */
/* const urlHeaderOptions = {
    mode: 'cors',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        // 'Access-Control-Allow-Origin':'*'
        'API-Key': 'secret'
    }
} */



// ***********************************************************
//      Checking if Dom is ready to initiate process in JS
// ***********************************************************

if (document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll)) {
    domLoaded();
} else {
    document.addEventListener("DOMContentLoaded", domLoaded);
}


/* <-----  Handler when the DOM is fully loaded  -----> */
function domLoaded() {
    var path = window.location.pathname;
    var page = path.split("/").pop();
    log(page);
    initializePage(page);
};


/* <-----  Categorizing different parts of code according to the page loaded  -----> */
function initializePage(page) {
    switch (page) {
        case "index.html":
            log('Home Page is Loaded !');
            initHomePage();
            break;
        case "explore.html":
            log('Explore Page is Loaded !');
            intiExplorePage();
            break;
        case "blogs.html":
            log('Blogs Page is Loaded !');
            initBlogsPage();
            break;
        case "blogDescription.html":
            log('Blog Description Page is Loaded !');
            initBlogDescriptionPage();
            break;
        case "contact.html":
            log('Contact Page is Loaded !');
            initContactPage();
            break;
        default:
            // log("Some Other Page is Loaded !");
            log('Home Page is Loaded !');
            initHomePage();
    }
    setUpNewsletter();
}


/* <-----  Function to set up newsletter section on every page  -----> */
function setUpNewsletter() {
    document.getElementById("submit-button").addEventListener('click', () => {
        let email = document.getElementById("email").value;
        let displayMessage = document.getElementById("newsletter-message");
        displayMessage.value = '';
        if (!email) {
            displayMessage.innerHTML = 'Please Enter Your Email ID!';
        } else if (!isEmailValid(email)) {
            displayMessage.innerHTML = 'Please Enter Valid Email ID!';
        } else {
            document.getElementById("email").value = '';
            document.getElementById("dialog-modal-container").style.display = "block";
            document.getElementById("close-button").addEventListener('click', () => {
                document.getElementById("dialog-modal-container").style.display = "none";
            })
        }

    });
}



// ***********************************************************
//      Setting Up Home Page
// ***********************************************************

/* <-----  Init function for home page  -----> */
function initHomePage() {
    log('Init Home Page Called');
    /* let map = new google.maps.Map(document.getElementById('general-heat-map'), {
        center: { lat: 60.2971469, lng: -97.4133973 }, // Centre for Canada
        zoom: 3.2
    }); */
    let map = new google.maps.Map(document.getElementById('general-heat-map'), mapOptions);

    // makeApiCallForDefaultProfession(map);
    makeApiCallForHomePageHeatMapData(cityListArr => {
        let citiesDataArr = [];
        cityListArr.forEach(cityObject => {
            citiesDataArr.push({
                lat: cityObject.Lat,
                lng: cityObject.Lng,
                jobCounts: cityObject.Number_Of_Job
            })
        });
        populateHeatMap(map, citiesDataArr);
    });
}


/* <-----  This function was not required anymore as default profession was changed
from '1'(Soft. and Prog.) to three different categories related to our field (soft., it and design)  -----> */
/* 
function makeApiCallForDefaultProfession(map) {
    log('Making Api Request for Jobs');

    let urlString = getApiUrlForJobsWithProfessionID(defaultProfessionId);
    fetch(urlString).then((res) => {
        res.json().then((responseData) => {
            log(responseData);
            let citiesDataArr = [];
            responseData.data.forEach(cityObject => {
                citiesDataArr.push({
                    lat: cityObject.Lat,
                    lng: cityObject.Lng,
                    jobCounts: cityObject.Number_Of_Job
                })
            });
            log(citiesDataArr);
            populateHeatMap(map, citiesDataArr);
        });
    }, (error) => {
        log(error);
    });
}
*/



// ***********************************************************
//      Setting Up Explore Page
// ***********************************************************

/* <-----  Init function for explore page  -----> */
function intiExplorePage() {
    log('Init Explore Page Called');
    let map = new google.maps.Map(document.getElementById('heat-map'), mapOptions);

    let barChart = am4core.create('wage-graph', am4charts.XYChart);

    let heatMapSpinner = document.getElementById('heat-map-profession-spinner');
    heatMapSpinner.addEventListener('change', () => {
        let jobCategoryIdSelected = heatMapSpinner.value;
        log('Spinner Value: ' + jobCategoryIdSelected);
        document.getElementById('heat-map').innerHTML = '';
        map = new google.maps.Map(document.getElementById('heat-map'), mapOptions);
        makeApiCallForJobsWithProfessionId(jobCategoryIdSelected, (cityListArr) => {
            let citiesDataArr = [];
            cityListArr.forEach(cityObject => {
                citiesDataArr.push({
                    lat: cityObject.Lat,
                    lng: cityObject.Lng,
                    jobCounts: cityObject.Number_Of_Job
                })
            });
            log(citiesDataArr);
            populateHeatMap(map, citiesDataArr);
        });
    });

    let wagesGraphSpinner = document.getElementById('wages-graph-profession-spinner');
    wagesGraphSpinner.addEventListener('change', () => {
        let jobCategoryIdSelected = wagesGraphSpinner.value;
        log('Spinner Value: ' + jobCategoryIdSelected);
        document.getElementById('wage-graph').innerHTML = '';
        barChart = am4core.create('wage-graph', am4charts.XYChart);
        makeApiCallForWagesWithProfessionId(jobCategoryIdSelected, (wageDataArr) => {
            let provincesDaraArr = [];
            wageDataArr.forEach(provinceObj => {
                provincesDaraArr.push({
                    name: provinceObj.Province_Code,
                    fullName: provinceObj.Province_Name,
                    points: provinceObj.Average_Wage,
                    color: "#2DB9EB"
                })
            });
            log(provincesDaraArr);
            populateBarChart(barChart, provincesDaraArr);
        });
    });

    /* <-----  Making api call for job category list  -----> */
    makeApiCallForJobCategoryList(jobCategoryListArr => {
        fillHeatMapJobCategorySpinner(jobCategoryListArr);
        fillBarChartJobCategorySpinner(jobCategoryListArr);

        let firstProfessionId = jobCategoryListArr[0].Category_ID;

        /* <-----  Making api call for job counts of first option from spinner  -----> */
        makeApiCallForJobsWithProfessionId(firstProfessionId, (cityListArr) => {
            let citiesDataArr = [];
            cityListArr.forEach(cityObject => {
                citiesDataArr.push({
                    lat: cityObject.Lat,
                    lng: cityObject.Lng,
                    jobCounts: cityObject.Number_Of_Job
                })
            });
            log(citiesDataArr);
            populateHeatMap(map, citiesDataArr);
        });

        /* <-----  Making api call for wages of first option from spinner  -----> */
        makeApiCallForWagesWithProfessionId(firstProfessionId, (wageDataArr) => {
            let provincesDaraArr = [];
            wageDataArr.forEach(provinceObj => {
                provincesDaraArr.push({
                    name: provinceObj.Province_Code,
                    fullName: provinceObj.Province_Name,
                    points: provinceObj.Average_Wage,
                    color: "#2DB9EB"
                })
            });
            log(provincesDaraArr);
            populateBarChart(barChart, provincesDaraArr);
        });
    });
}


/* <-----  Function to populate options in spinner of heat map  -----> */
function fillHeatMapJobCategorySpinner(dataArr) {
    for (let i = 0; i < dataArr.length; i++) {
        let spinner = document.getElementById('heat-map-profession-spinner');
        spinner.options[i] = new Option(dataArr[i].Category, dataArr[i].Category_ID);
    }
}


/* <-----  Function to populate options in spinner of wages bar chart  -----> */
function fillBarChartJobCategorySpinner(dataArr) {
    for (let i = 0; i < dataArr.length; i++) {
        let spinner = document.getElementById('wages-graph-profession-spinner');
        spinner.options[i] = new Option(dataArr[i].Category, dataArr[i].Category_ID);
    }
}



// ***********************************************************
//      Setting Up Blogs Page
// ***********************************************************

/* <-----  Init function for blog page  -----> */
function initBlogsPage() {
    log('Init Blogs Page Called');

    /* <-----  Making api call for list of blogs  -----> */
    makeApiCallForBlogsList(blogsListDataArr => {
        let popularBlogsArr = [];
        let recentBlogsArr = [];
        blogsListDataArr.forEach(blogItem => {
            let blogDateStr = getDateString(blogItem.Blog_Date);
            blogItem.Blog_Date = blogDateStr;
            if (blogItem.Blog_Type === 1) {
                popularBlogsArr.push(blogItem);
            } else {
                recentBlogsArr.push(blogItem);
            }
        });

        log('Popular Blogs Arr');
        log(popularBlogsArr);
        populatePopularBlogsList(popularBlogsArr);

        log('Recent Blogs Arr');
        log(recentBlogsArr);
        populateRecentBlogsList(recentBlogsArr);

        /* <-----  Reference code for opening an html with query from javascript  -----> */
        /* <-----  Later this was handled within the href of each blog element by passing blog ID  -----> */
        // document.getElementById('blogs-container').addEventListener('click', function () {
        //     blogId = 1;
        //     var queryString = "?blogId=" + blogId;
        //     window.location.href = "blogDescription.html" + queryString;
        // });
    });
}


/* <-----  Populating the list of popular blogs from the data received  -----> */
function populatePopularBlogsList(blogsArr) {
    let blogsContainer = document.getElementById('blogs-container-popular');
    blogsContainer.innerHTML = ``;
    blogsArr.forEach((blog, i) => {
        let htmlString = ``;
        htmlString += `<div class="blog-container blog${i + 1}">`;
        htmlString += `<div class="blog-detail-container">`;
        htmlString += `<img src="${blog.Blog_Image_Thumbnail_Link}" alt="${blog.Blog_Image_Source_Link}">`;
        htmlString += `<div class="blog-title">${blog.Blog_Title}</div>`;
        htmlString += `<div class="blog-date">${blog.Blog_Date}</div>`;
        htmlString += `<a href="blogDescription.html?blogId=${blog.Blog_ID}" class="read-more-button">Read More</a>`;
        htmlString += `</div>`;
        htmlString += `<div class="blog-detail-on-hover" style="background-image: linear-gradient(to right bottom, #0000007e, #000000ee), url(${blog.Blog_Image_Thumbnail_Link});">`;
        htmlString += `<div class="blog-description">${truncateString(blog.Blog_Description, 100)}</div>`;
        htmlString += `<a href="blogDescription.html?blogId=${blog.Blog_ID}" class="read-now-button">Read More</a>`;
        htmlString += `</div>`;
        htmlString += `</div>`;
        blogsContainer.innerHTML += htmlString;
    });
}


/* <-----  Populating the list of recent blogs from the data received  -----> */
function populateRecentBlogsList(blogsArr) {
    let blogsContainer = document.getElementById('blogs-container-recent');
    blogsContainer.innerHTML = ``;
    blogsArr.forEach((blog, i) => {
        let htmlString = ``;
        htmlString += `<div class="blog-container blog${i + 1}">`;
        htmlString += `<div class="blog-detail-container">`;
        htmlString += `<img src="${blog.Blog_Image_Thumbnail_Link}" alt="${blog.Blog_Image_Source_Link}">`;
        htmlString += `<div class="blog-title">${blog.Blog_Title}</div>`;
        htmlString += `<div class="blog-date">${blog.Blog_Date}</div>`;
        htmlString += `<a href="blogDescription.html?blogId=${blog.Blog_ID}" class="read-more-button">Read More</a>`;
        htmlString += `</div>`;
        htmlString += `<div class="blog-detail-on-hover" style="background-image: linear-gradient(to right bottom, #0000007e, #000000ee), url(${blog.Blog_Image_Thumbnail_Link});">`;
        htmlString += `<div class="blog-description">${truncateString(blog.Blog_Description, 100)}</div>`;
        htmlString += `<a href="blogDescription.html?blogId=${blog.Blog_ID}" class="read-now-button">Read More</a>`;
        htmlString += `</div>`;
        htmlString += `</div>`;
        blogsContainer.innerHTML += htmlString;
    });

}



// ***********************************************************
//      Setting Up Blog Description Page
// ***********************************************************

/* <-----  Init function for blog description page  -----> */
function initBlogDescriptionPage() {
    log('Init Blog Description Page Called');

    const blogId = getBlogId();

    makeApiCallForBlogData(blogId, (blogData) => {
        // log(blogData);
        populateBlogData(blogData[0]);
    });

}


/* <-----  Function to get blog id from query string  -----> */
function getBlogId() {
    /* <-----  Primitive way of fetching params  -----> */
    /* var queryString = decodeURIComponent(window.location.search);
    queryString = queryString.substring(1);
    var queries = queryString.split("&");
    for (var i = 0; i < queries.length; i++) {
        log(queries[i]);
    } */

    /* <-----  This works on most browsers except IE  -----> */
    let urlParams = new URLSearchParams(window.location.search);
    let myParamVar = urlParams.get('blogId');
    log(myParamVar);

    return myParamVar;
}


/* <-----  Function to display blog data on respective elements of the html page  -----> */
function populateBlogData(blogData) {
    document.getElementById('blog-title').innerHTML = blogData.Blog_Title;
    document.getElementById('blog-category').innerHTML = blogData.Blog_Type === 1 ? 'Popular' : 'Recent';
    document.getElementById('blog-date').innerHTML = getDateString(blogData.Blog_Date);
    document.getElementById('blog-image').src = blogData.Blog_Image_Link;
    document.getElementById('blog-image').alt = blogData.Blog_Image_Source_Link;
    document.getElementById('blog-content').innerHTML = blogData.Blog_Description;
    document.getElementById('blog-link').innerHTML = `<a href='${blogData.Blog_Link}'>Go to the Website</a>`;
}



// ***********************************************************
//      Setting Up Contact Page
// ***********************************************************

/* <-----  Init function for contact page  -----> */
function initContactPage() {
    document.getElementById("button-contact-submit").addEventListener('click', () => {

        let name = document.getElementById("txtName").value;
        let email = document.getElementById("txtEmail").value;
        let message = document.getElementById("txtMessage").value;
        let displayMessage = document.getElementById("displayMessage");
        displayMessage.innerHTML = '';
        if (!name) {
            displayMessage.innerHTML = 'Please Enter Your Name!';
        } else if (!isNameValid(name)) {
            displayMessage.innerHTML = 'Please Write Valid Name!';
        } else if (!email) {
            displayMessage.innerHTML = 'Please Enter Your Email ID!';
        } else if (!isEmailValid(email)) {
            displayMessage.innerHTML = 'Please Enter Valid Email ID!';
        } else if (!message) {
            displayMessage.innerHTML = 'Please Enter Your Message or Query!';
        } else if (message.length < 100) {
            displayMessage.innerHTML = 'Please enter message of 100 characters atleast!';
        } else {
            document.getElementById("txtName").value = '';
            document.getElementById("txtEmail").value = '';
            document.getElementById("txtMessage").value = '';
            displayMessage.style.color = '#13970C';
            displayMessage.innerHTML = 'Thank You! For Sending Your Query. We Will Get Back to You Soon!!';
        }
    });
}



// ***********************************************************
//      Common Functions
// ***********************************************************

/* <-----  Function to plot the heat map, requires map object and data array  -----> */
function populateHeatMap(map, citiesDataArr) {

    var heatMapData = [];
    let maxDataValue = Math.max.apply(null, citiesDataArr.map(item => item.jobCounts));
    citiesDataArr.forEach(city => {
        weightValue = city.jobCounts / maxDataValue * 100;

        /* <-----  If the percent value is really low we bump it up so at least something is visible on map  -----> */
        if (weightValue > 0 && weightValue <= 5) {
            weightValue = 5;
        } else {
            weightValue = weightValue;
        }
        heatMapData.push({
            location: new google.maps.LatLng(city.lat, city.lng),
            weight: weightValue
        });
    });

    var heatMap = new google.maps.visualization.HeatmapLayer({
        data: heatMapData
    });

    heatMap.set('opacity', heatMap.get('opacity') ? null : 0.8); //  0.60 is default
    heatMap.set('radius', heatMap.get('radius') ? null : 25); //  25 is default
    heatMap.setMap(map);
}


/* <-----  Function to create the bar chart, requires chart object and data array  -----> */
function populateBarChart(chart, chartData) {

    am4core.ready(function () {
        am4core.useTheme(am4themes_animated);

        chart.data = chartData;

        /* <-----  Setting up axes of bar charts  -----> */
        var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "name";
        categoryAxis.renderer.grid.template.disabled = true;
        categoryAxis.renderer.minGridDistance = 30;
        categoryAxis.renderer.inside = true;
        categoryAxis.renderer.labels.template.fill = am4core.color("#fff");
        categoryAxis.renderer.labels.template.fontSize = 15;

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.grid.template.strokeDasharray = "4,4";
        valueAxis.renderer.labels.template.disabled = true;
        valueAxis.min = Math.min(null, chartData.map(item => item.points));

        chart.maskBullets = false;
        chart.paddingBottom = 0;

        /* <-----  Creating bars of bar charts with hover text  -----> */
        var series = chart.series.push(new am4charts.ColumnSeries());
        series.dataFields.valueY = "points";
        series.dataFields.categoryX = "name";
        series.columns.template.propertyFields.fill = "color";
        series.columns.template.propertyFields.stroke = "color";
        series.columns.template.column.cornerRadiusTopLeft = 0;
        series.columns.template.column.cornerRadiusTopRight = 0;
        series.columns.template.tooltipText = "[font-size: 13]{fullName}: [bold font-size: 13]{valueY}[/b]";
        series.tooltip.autoTextColor = false;
    });
}



// ***********************************************************
//      Common Functions
// ***********************************************************

/* <-----  Converting simple date string from response to the required fromat  -----> */
function getDateString(date) {
    let blogDate = new Date(date);
    let blogDay = blogDate.getDate();
    let blogMonth = blogDate.getMonth();
    let blogYear = blogDate.getFullYear();
    let dateString = `${blogDay} ${months[blogMonth]}, ${blogYear}`;

    return dateString;
}


/* <-----  Function to limit string to a certain num of characters with '...' at the end  -----> */
function truncateString(str, num) {
    if (str.length <= num) {
        return str
    }
    return str.slice(0, num) + '...'
}


/* <-----  Function to validate name  -----> */
function isNameValid(name) {
    let regName = `^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$`;
    if (!name.match(regName)) {
        return false;
    }
    return true;
}


/* <-----  Function to validate email  -----> */
function isEmailValid(email) {
    let regEmailId = `^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$`;
    if (!email.match(regEmailId)) {
        return false;
    }
    return true;
}



// ***********************************************************
//      Functions for API Calling
// ***********************************************************

function makeApiCallForHomePageHeatMapData(callback) {
    log('Making Api Request for Home Page Heat Map Data');

    let urlString = getApiUrlForDefaultJobsData();
    fetch(urlString).then((res) => {
        res.json().then((responseData) => {
            log(responseData);
            callback(responseData.data);
        });
    }, (error) => {
        log(error);
    });
}


function makeApiCallForJobCategoryList(callback) {
    log('Making Api Request for Job Category List');

    let urlString = getApiUrlForJobCategoryList();
    fetch(urlString).then((res) => {
        res.json().then((responseData) => {
            log(responseData);
            callback(responseData.data);
        });
    }, (error) => {
        log(error);
    });
}


function makeApiCallForJobsWithProfessionId(professionId, callback) {
    log('Making Api Request for Jobs with Category ID: ' + professionId);

    let urlString = getApiUrlForJobsWithProfessionID(professionId);
    fetch(urlString).then((res) => {
        res.json().then((responseData) => {
            log(responseData);
            callback(responseData.data);
        });
    }, (error) => {
        log(error);
    });
}


function makeApiCallForWagesWithProfessionId(professionId, callback) {
    log('Making Api Request for Wages with Category ID: ' + professionId);

    let urlString = getApiUrlForWagesWithProfessionID(professionId);
    fetch(urlString).then((res) => {
        res.json().then((responseData) => {
            log(responseData);
            callback(responseData.data);
        });
    }, (error) => {
        log(error);
    });
}


function makeApiCallForBlogsList(callback) {
    log('Making Api Request for Blogs List');

    let urlString = getApiUrlForBlogsList();
    fetch(urlString).then((res) => {
        res.json().then((responseData) => {
            log(responseData);
            callback(responseData.data);
        });
    }, (error) => {
        log(error);
    });
}


function makeApiCallForBlogData(blogId, callback) {
    log('Making Api Request for Blog Data');

    let urlString = getApiUrlForBlogData(blogId);
    fetch(urlString).then((res) => {
        res.json().then((responseData) => {
            log(responseData);
            callback(responseData.data);
        });
    }, (error) => {
        log(error);
    });
}



// ***********************************************************
//      API Url Functions
// ***********************************************************

function getApiUrlForDefaultJobsData() {
    let apiUrl = getBaseUrl();
    apiUrl += defaultHomeDataUrl;
    log('Url: ' + apiUrl);

    return apiUrl;
}

function getApiUrlForJobCategoryList() {
    let apiUrl = getBaseUrl();
    apiUrl += jobCategoryApiUrl;
    log('Url: ' + apiUrl);

    return apiUrl;
}


function getApiUrlForJobsWithProfessionID(professionId) {
    let apiUrl = getBaseUrl();
    apiUrl += jobsApiUrl;
    apiUrl += `?professionId=${professionId}`;
    log('Url: ' + apiUrl);

    return apiUrl;
}


function getApiUrlForWagesWithProfessionID(professionId) {
    let apiUrl = getBaseUrl();
    apiUrl += wagesApiUrl;
    apiUrl += `?professionId=${professionId}`;
    log('Url: ' + apiUrl);

    return apiUrl;
}


function getApiUrlForBlogsList() {
    let apiUrl = getBaseUrl();
    apiUrl += blogsApiUrl;
    log('Url: ' + apiUrl);

    return apiUrl;
}


function getApiUrlForBlogData(blogId) {
    let apiUrl = getBaseUrl();
    apiUrl += singleBlogApiUrl;
    apiUrl += `?blogId=${blogId}`;
    log('Url: ' + apiUrl);

    return apiUrl;
}


/* 
function getBaseUrl() {
    return 'http://localhost:3000';
}
 */
function getBaseUrl() {
    return 'http://server.metier.wmdd.ca';
}

