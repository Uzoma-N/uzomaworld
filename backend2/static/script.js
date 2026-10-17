// static/script.js

// This array (CERTIFICATIONS_DATA) is populated from the HTML script tag
// with data passed by Flask.

 'use strict';

import { createCertificationHTML, createEducationHTML, createProjectFilterHTML } from './jsHTMLs.js';
import { createServiceHTML, createSocialHTML, createCatHTML, createExperienceHTML } from './jsHTMLs.js';
import { createSkillHTML, createProjectHTML, createProjectSelectHTML } from './jsHTMLs.js';

// Global variable definition is now a function call
const CV_DATA = getAllData();

// Global DOM references (defined here for scope)
const profileSelect = document.getElementById('profile-select');
const categoryMultiselect = document.getElementById('category-multiselect-list');
const categoryOptionsList = document.getElementById('cat-options-list');
const selectedCatsDisplay = document.getElementById('selected-cats-display');
const changeProfileBtn = document.getElementById('change-profile-btn');
const applyFilterBtn = document.getElementById('apply-filter-btn');

// State Variables
let profileURIs = {}; // Stores name -> URI mapping fetched from API
let selectedCategories = ['All']; // Stores current filter state (default is All)
const DEFAULT_CATEGORY = 'database'; // CV category ticked when a profile loads

// --- Get the data from the dedicated script block ---
function getAllData() {
    // 1. Find the script tag by its ID
    const container = document.getElementById('all-data-container');
    
    // Safety check: ensure the container exists
    if (!container) {
        console.error("CV_DATA container not found in HTML.");
        return [];
    }

    // 2. Get the text content (which is the pure JSON string)
    const jsonString = container.textContent;

    // 3. Parse the JSON string safely
    try {
        // You now only run JSON.parse on the inner content, which is protected
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse CV_DATA:", e);
        console.log("Raw JSON String:", jsonString);
        return [];
    }
}


/**
 * Renders all education data to the DOM.
 */
function renderAllData() {
    
    getProfiles(CV_DATA.NameList)
    getCategories(CV_DATA.Category)
    getUserDetails(CV_DATA.Details, CV_DATA.Name)
    getSocial(CV_DATA.Social)
    getService(CV_DATA.Service)
    getEducation(CV_DATA.Education);
    getWorkExperience(CV_DATA.WorkExperience);
    getSkill(CV_DATA.Skills, CV_DATA.SkillType);
    getCertification(CV_DATA.Certificate);
    getProjectClass(CV_DATA.ProjectClass);
    getProject(CV_DATA.Project);
    applyCategoryFilter(); // apply the default category ticked in getCategories

    // 2. Attach the listener for the 'Change Profile' button
    changeProfileBtn.addEventListener('click', fetchFilteredCV);
    applyFilterBtn.addEventListener('click', applyCategoryFilter);
}

function getUserDetails(Details_Data, Name){
    const userData = document.getElementById('detail-data');
    userData.innerHTML = '';
    const aboutUser = document.getElementById('about-data');
    aboutUser.innerHTML = '';
    const imageData = document.getElementById('image-data');
    imageData.innerHTML = '';
    const nameRoleData = document.getElementById('nameRole-data');
    const nameData = Name;
    nameRoleData.innerHTML = `
                <h1 class="name" title="${nameData}">
                    ${nameData}
                </h1>

                <p class="title">${Details_Data[0].roleTitle}</p>  `

    // add the filepath for photo
    if (Details_Data[0].photo !== ''){
        imageData.innerHTML = `
                <figure class="avatar-box">
                    <img
                        src="static/${String(Details_Data[0].photo).replace(/^\//, '')}"                        
                        alt="${nameData} "
                        width="80"
                    />
                </figure>  `
    } else{
        imageData.innerHTML = `
                <figure class="avatar-box">
                    <img
                        src="static/assets/avatar-5.png"                        
                        alt="${nameData} "
                        width="80"
                    />
                </figure>  `
    }

    let email = '';
    if (Details_Data[0].emailAddress !== ''){
        email = `
                <li class="contact-item">
                    <div class="icon-box">
                        <ion-icon name="mail-outline"></ion-icon>
                    </div>

                    <div class="contact-info">
                        <p class="contact-title">Email</p>

                        <a
                        href="mailto:${Details_Data[0].emailAddress}"
                        class="contact-link"
                        >${Details_Data[0].emailAddress}</a
                        >
                    </div> 
                </li> `
    }

    let phone = '';
    if (Details_Data[0].phoneNumber !== ''){
        phone = `
                <li class="contact-item">
                    <div class="icon-box">
                        <ion-icon name="phone-portrait-outline"></ion-icon>
                    </div>

                    <div class="contact-info">
                        <p class="contact-title">Phone</p>

                        <a
                        href="tel:${Details_Data[0].phoneNumber}"
                        class="contact-link"
                        >${Details_Data[0].phoneNumber}</a
                        >
                    </div>
                </li>`
    }

    let birthday = '';
    if (Details_Data[0].dob !== ''){
        birthday = `
                <li class="contact-item">
                    <div class="icon-box">
                        <ion-icon name="calendar-outline"></ion-icon>
                    </div>

                    <div class="contact-info">
                        <p class="contact-title">Birthday</p>

                        <time datetime="${Details_Data[0].dob}"
                        >${Details_Data[0].dob}</time
                        >
                    </div>
                </li>`
    }

    let location = '';
    if (Details_Data[0].address !== ''){
        location = `
                <li class="contact-item" >
                    <div class="icon-box">
                        <ion-icon name="location-outline"></ion-icon>
                    </div>

                    <div class="contact-info">
                        <p class="contact-title">Location</p>

                        <address>${Details_Data[0].address}</address>
                    </div>
                </li>`
    }

    if (Details_Data[0].aboutMe !== ''){
        aboutUser.innerHTML = `
                <p>${Details_Data[0].aboutMe}</p>  `
    } else{
        aboutUser.innerHTML = `
                <p>Please, consider writing an AboutMe post.</p>  `
    }

    userData.innerHTML = `${email} ${phone} ${birthday} ${location} ` ;
}

function getProfiles(Profile_Data){
    const listProfile = document.getElementById('profile-select');    
    listProfile.innerHTML = ''; // Clear previous content    
    //const Profile_Data = CV_DATA.NameList

    let profileHtmlContent = ''
    if (Profile_Data && Profile_Data.length > 0) {
        Profile_Data.forEach(profile => {
            profileHtmlContent += `
                            <option value="${profile}">${profile}</option> `
            // console.log("Ed Data Array:", study);
        });
        listProfile.innerHTML = profileHtmlContent;
    } else {
        listProfile.innerHTML = '';
    }
}

function getCategories(Category_Data){
    const listCategory = document.getElementById('cat-options-list');    
    listCategory.innerHTML = ''; // Clear previous content    
    //const Category_Data = CV_DATA.Category

    // Start on the default category; fall back to 'All' if this profile doesn't have it
    const hasDefault = (Category_Data || []).some(cat => String(cat.main).toLowerCase() === DEFAULT_CATEGORY);

    let categoryHtmlContent = `
                                <label class="category-item">
                                    <input type="checkbox" data-value="all" ${hasDefault ? '' : 'checked'}>
                                    <span>All</span>
                                </label>  `
    if (Category_Data && Category_Data.length > 0) {
        Category_Data.forEach(cat => {
            categoryHtmlContent += createCatHTML(cat, String(cat.main).toLowerCase() === DEFAULT_CATEGORY)
            // console.log("Ed Data Array:", study);
        });   
        listCategory.innerHTML = categoryHtmlContent     
    } else {
        listCategory.innerHTML = '';
    }
    //attachCategoryChangeListeners();
}

function getEducation(Education_Data){
    const listEducation = document.getElementById('education-list');    
    listEducation.innerHTML = ''; // Clear previous content    
    //const Education_Data = CV_DATA.Education

    if (Education_Data && Education_Data.length > 0) {
        Education_Data.forEach(study => {
            listEducation.innerHTML += createEducationHTML(study);
            // console.log("Ed Data Array:", study);
        });

    } else {
        listEducation.innerHTML = '<p>No education data available.</p>';
    }
}

function getService(Service_Data){
    const listService = document.getElementById('services-list');    
    listService.innerHTML = ''; // Clear previous content    
    //const Service_Data = CV_DATA.Service

    if (Service_Data && Service_Data.length > 0) {
        Service_Data.forEach(serve => {
            listService.innerHTML += createServiceHTML(serve);
            // console.log("Ed Data Array:", study);
        });

    } else {
        listService.innerHTML = '<p>No service data available.</p>';
    }
}

function getSocial(Social_Data){
    const listSocial = document.getElementById('socials-list');    
    listSocial.innerHTML = ''; // Clear previous content    
    //const Social_Data = CV_DATA.Social

    if (Social_Data && Social_Data.length > 0) {
        Social_Data.forEach(soccy => {
            listSocial.innerHTML += createSocialHTML(soccy);
            // console.log("Ed Data Array:", study);
        });

    } else {
        listSocial.innerHTML = '';
    }
}

function getWorkExperience(Experience_Data){
    const listExperience = document.getElementById('experience-list');    
    listExperience.innerHTML = '';     
    //const Experience_Data = CV_DATA.WorkExperience

    if (Experience_Data && Experience_Data.length > 0) {
        Experience_Data.forEach(job => {
            listExperience.innerHTML += createExperienceHTML(job);
            // console.log("Exp Data Array:", job);
        });

    } else {
        listExperience.innerHTML = '<p>No experience data available.</p>';
    }
}

function getSkill(Skill_Data, Skill_Type){
    const listSkill = document.getElementById('skill-list'); 
    listSkill.innerHTML = '';         
    //const Skill_Data = CV_DATA.Skills
    //const Skill_Type = CV_DATA.SkillType

    let skillHtmlContent = ''
    if (Skill_Type && Skill_Type.length > 0) {
        Skill_Type.forEach(stype=> {
            // Start a new skill group (the <ul> element) and add the title (h4)
            skillHtmlContent += `
                        <h4 class="h4 skills-title">${stype.main}</h4>
                        <ul class="skills-list content-card">    `
            // Iterate through ALL skill data to find matching skills
            Skill_Data.forEach(skill=> {                
                // Check if the skill's type matches the current group's main name
                if (stype.main === skill.typename[0]) {

                    // Append the HTML for the individual skill item
                    // createSkillHTML(skill) MUST return a string (e.g., <li>...</li>)
                    // console.log("Skill Data Array:", skill.typename);
                    skillHtmlContent += createSkillHTML(skill) ;
                }

            })
            // Close the current skill group (the </ul> element)
            skillHtmlContent += `
                         </ul>` ;
        })
        // Assign the completed HTML string to the DOM element ONLY ONCE
        // console.log("Skill Data Array:", skillHtmlContent);
        listSkill.innerHTML = skillHtmlContent ;
    } else {
        listSkill.innerHTML = '<p>No skill data available.</p>';
    }
}

function getCertification(Certification_Data){
    const listCertification = document.getElementById('certification-list');
    listCertification.innerHTML = '';
    //const Certification_Data = CV_DATA.Certificate

    if (Certification_Data && Certification_Data.length > 0) {
        Certification_Data.forEach(cert => {
            listCertification.innerHTML += createCertificationHTML(cert);
            // console.log("Exp Data Array:", job);
        });

    } else {
        listCertification.innerHTML = '<p>No training data available.</p>';
    }
}

function getProjectClass(Project_Class_Data){
    const listProjectFilter = document.getElementById('project-filter-list');
    const listProjectSelect = document.getElementById('project-select-list');
    listProjectFilter.innerHTML = ''; 
    listProjectSelect.innerHTML = '';
    //const Project_Class_Data = CV_DATA.ProjectClass

    let projectFilterContent = `
                                <li class="filter-item">
                                    <button class="active" data-filter-btn>All</button>
                                </li> `
    let projectSelectContent = `
                                <li class="select-item">
                                    <button data-select-item>All</button>
                                </li>`

    if (Project_Class_Data && Project_Class_Data.length > 0) {
        Project_Class_Data.forEach(pClass => {
            projectFilterContent += createProjectFilterHTML(pClass);
            projectSelectContent += createProjectSelectHTML(pClass);
            // console.log("Exp Data Array:", job);
        });        

    } else {
        projectFilterContent += '';
        projectSelectContent += '';
    }
    listProjectFilter.innerHTML = projectFilterContent; 
    listProjectSelect.innerHTML = projectSelectContent;

    // Call a function to set up listeners after rendering
    attachFilterListeners();
}

function getProject(Project_Data){
    const listProject = document.getElementById('projects-list');
    listProject.innerHTML = '';
    //const Project_Data = CV_DATA.Project

    // Initialize a variable named 'count' with the value 0 to add active to the first instance
    let count = 1; 

    // Initialize a variable named 'score' with a floating-point value
    const first = 1.5;
    

    if (Project_Data && Project_Data.length > 0) {
        Project_Data.forEach(project => {           
            listProject.innerHTML += createProjectHTML(project, "active");                
            // console.log("Exp Data Array:", job);             
        });
    } else {
        listProject.innerHTML = '<p>No project data available.</p>';
    }
    // Call a function to set up listeners after rendering
    attachProjectListeners();    
}

// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });


// add click event to modal close button
//modalCloseBtn.addEventListener("click", testimonialsModalFunc);
//overlay.addEventListener("click", testimonialsModalFunc);

// custom select variables
const select = document.querySelector("[data-select]");
const selectValue = document.querySelector("[data-selecct-value]");

select.addEventListener("click", function () { elementToggleFunc(this); });

const attachProjectListeners = function() {
    
    const selectItems = document.querySelectorAll("[data-select-item]");
    
    // add event in all select items
    for (let i = 0; i < selectItems.length; i++) {
        selectItems[i].addEventListener("click", function () {

            //let selectedValue = this.innerText.toLowerCase();
            //selectValue.innerText = this.innerText;
            //elementToggleFunc(select);
            //filterFunc(selectedValue);
            activeProjectType = this.innerText.toLowerCase(); 
            selectValue.innerText = this.innerText;
            elementToggleFunc(select);
            masterFilterFunc();

        });
    }
}

// --- STATE VARIABLES (Assuming these are exported/imported from app-state.js) ---
// Note: We need a state for the currently active Project Type filter.
// We'll assume the currently active filter button's value is stored in this variable.
let activeProjectType = "all"; 
let selectedCVCategories = ['all']; // The state from your multi-select checkboxes

// --- CORE FILTERING FUNCTION ---

/**
 * Master function to filter project items based on TWO criteria:
 * 1. Project Type (Single-select, from filter buttons/dropdown)
 * 2. CV Categories (Multi-select, from checkboxes)
 */
const masterFilterFunc = function () {
    
    // 1. Get all items that need filtering (your project list)
    const filterItems = document.querySelectorAll("[data-filter-item]");
    
    // Determine if the CV Category filter is effectively 'all'
    const showAllCVCategories = selectedCVCategories.includes('all');

    for (let i = 0; i < filterItems.length; i++) {
        const item = filterItems[i];
        
        // --- CRITERION 1: Project Type Filter 
        const itemProjectType = item.dataset.clas ? item.dataset.clas.toLowerCase() : '';
        
        // Check if the item matches the active single-select filter
        const isProjectTypeMatch = (
            activeProjectType === "all" || 
            activeProjectType === itemProjectType
        );

        // --- CRITERION 2: CV Category Filter (New logic for multi-value data-category) ---
        let isCVCategoryMatch = false;

        if (showAllCVCategories) {
            // Match 1: If 'All' is selected, this criterion is always met.
            isCVCategoryMatch = true;
        } else {
            // Match 2: Check multi-value attribute intersection
            const itemCVCategoriesString = item.getAttribute('data-category');
            
            if (itemCVCategoriesString) {
                // Split, trim, and normalize the item's categories (e.g., ["database", "software"])
                const itemCVCategories = itemCVCategoriesString
                    .split(',')
                    .map(cat => cat.trim().toLowerCase());

                // Check if ANY selected category is present in the item's category list
                isCVCategoryMatch = selectedCVCategories.some(selectedValue => 
                    itemCVCategories.includes(selectedValue)
                );
            }
        }
        
        // --- FINAL DECISION: Must satisfy BOTH criteria ---
        if (isProjectTypeMatch && isCVCategoryMatch) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    }
};

// Function to handle the active class toggling and filtering logic
const attachFilterListeners = function() {
    // 1. Re-select the filter buttons since they were just rendered
    const filterBtns = document.querySelectorAll("[data-filter-btn]");
    
    // Also re-select the select items if needed, but we'll focus on filterBtns for now
    // const selectItems = document.querySelectorAll("[data-select-item]");

    // Re-initialize the lastClickedBtn variable with the "All" button
    let lastClickedBtn = filterBtns[0];
    
    // 2. Add event in all filter button items for large screen
    for (let i = 0; i < filterBtns.length; i++) {

        filterBtns[i].addEventListener("click", function () {

            //let selectedValue = this.innerText.toLowerCase();
            // Assuming selectValue is defined globally and available
            activeProjectType = this.innerText.toLowerCase();
            selectValue.innerText = this.innerText; 
            //filterFunc(selectedValue);
            masterFilterFunc();

            lastClickedBtn.classList.remove("active");
            this.classList.add("active");
            lastClickedBtn = this;

        });
    }
}

// Must match slugify() in app.py
function slugify(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function fetchFilteredCV() {
    // 1. Get current filter selections
    const user_namer = profileSelect.value;

    // Show a loading indicator (optional, but good practice)
    //listProject.innerHTML = '<p class="loading-message">Loading new profile data...</p>';

    try {
        // 2. Load the profile JSON. Relative URL, so it works on Flask
        // (/data/<slug>.json route) and on a static host (pre-built files).
        const response = await fetch(`data/${slugify(user_namer)}.json`);

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        //const filteredCV_Data = await response.text();
        //const filteredCV_JSON = JSON.parse(filteredCV_Data);
        const filteredCV_JSON = await response.json();


        // 3. Clear existing data and render new content
        // The listProject.innerHTML has already been cleared by the loading message above, 
        // but we clear it explicitly before rendering the final content.
        //getProfiles(CV_DATA.NameList)
        getCategories(filteredCV_JSON.Category);
        getUserDetails(filteredCV_JSON.Details, filteredCV_JSON.Name);
        getSocial(filteredCV_JSON.Social);
        getService(filteredCV_JSON.Service);
        getEducation(filteredCV_JSON.Education);
        getWorkExperience(filteredCV_JSON.WorkExperience);
        getSkill(filteredCV_JSON.Skills, filteredCV_JSON.SkillType);
        getCertification(filteredCV_JSON.Certificate);
        getProjectClass(filteredCV_JSON.ProjectClass);
        getProject(filteredCV_JSON.Project);
        applyCategoryFilter(); // apply the default category ticked in getCategories

        // Call your dedicated function to process the filtered RDF data 
        // and insert the necessary HTML into listProject.
        //renderCV(filteredData); 

    } catch (error) {
        console.error("Error applying filters:", error);
        // Display an error message if the fetch fails
        
    }
}

function applyCategoryFilter() {
    
    // 1. Retrieve all checked category values
    const checkedCheckboxes = document.querySelectorAll('#cat-options-list input[type="checkbox"]:checked');
    
    // Create an array of values (e.g., ['software', 'research', 'All'])
    let calcSelectedValues = Array.from(checkedCheckboxes)
        .map(checkbox => checkbox.getAttribute('data-value').toLowerCase());

    // 2. Implement the 'Select All' Override
    const showAll = calcSelectedValues.includes('all');

    // If 'All' is present, simplify the list to just ['all'] 
    // This is the core logic for the override.
    if (showAll) {
        calcSelectedValues = ['all'];
    }

    // --- NEW: Update the Global State Variable ---
    // Ensure the filtering function has access to the correct state
    selectedCVCategories = calcSelectedValues;

    masterFilterFunc()
    // 3. Get all items that need filtering
    const CertificationItems = document.querySelectorAll('.certification-item');
    const ExperienceItems = document.querySelectorAll('.exp-timeline-item');
    const SkillItems = document.querySelectorAll('.skills-item[data-skill-group="Digital Skill"]');

    filterCVSection(CertificationItems, calcSelectedValues, showAll)
    filterCVSection(ExperienceItems, calcSelectedValues, showAll)
    filterCVSection(SkillItems, calcSelectedValues, showAll)
}


function filterCVSection(Items, selectedValues, showAll) {
    // 3. Get all items that need filtering
    

    // 4. Loop through projects and apply visibility (using the 'active' class)
    Items.forEach(item => {
        //const itemCategory = item.getAttribute('data-category').toLowerCase();
        let shouldShow = false;

        if (showAll) {
            // Case 1: If 'All' is selected, show everything.
            shouldShow = true;
        } else {
            // Get the item's categories string, split it, clean up whitespace, and convert to lowercase
            const itemCategoriesString = item.getAttribute('data-category');
            
            // Handle case where data-category might be missing or empty
            if (!itemCategoriesString) {
                shouldShow = false;
            } else {
                const itemCategories = itemCategoriesString
                    .split(',')
                    .map(cat => cat.trim().toLowerCase());

                // Check for intersection: Is ANY selected value present in the item's categories?
                shouldShow = selectedValues.some(selectedValue => 
                    itemCategories.includes(selectedValue)
                );
            }
        }

        // Apply or remove the 'active' class to control visibility via CSS
        if (shouldShow) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    console.log("Categories selected for filtering:", selectedValues);

}


// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {

    // **Part 1: Deactivate all navigation links**
    // This ensures only one link is 'active' at a time.
    navigationLinks.forEach(link => link.classList.remove("active"));

    // **Part 2: Activate the clicked link (this)**
    this.classList.add("active");

    // Part 3: Loop through pages to find a match and toggle its 'active' class
    const clickedPageName = this.innerHTML.toLowerCase(); // 'about' or 'training'

    for (let j = 0; j < pages.length; j++) {
      if (clickedPageName === pages[j].dataset.page) {
        // Only activate the matched page
        pages[j].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        // Deactivate all other pages
        pages[j].classList.remove("active");
      }
    }
  });
}

// --- CONTACT FORM VARIABLES ---
const form = document.getElementById("contactForm");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");
const formStatus = document.getElementById("form-status");

// Function to display status messages
function displayStatus(message, isError = false) {
    formStatus.textContent = message;
    formStatus.classList.remove('hidden', 'bg-red-100', 'text-red-700', 'bg-green-100', 'text-green-700');
        
    // Use Tailwind classes to style the message box
    if (isError) {
        formStatus.classList.add('bg-red-100', 'text-red-700');
    } else {
         formStatus.classList.add('bg-green-100', 'text-green-700');
    }
}

// Existing logic: enable/disable button based on validation (retains your original functionality)
for (let i = 0; i < formInputs.length; i++) {
    formInputs[i].addEventListener("input", function () {
        if (form.checkValidity()) {
            formBtn.removeAttribute("disabled");
        } else {
            formBtn.setAttribute("disabled", "");
        }
    });
}

// NEW LOGIC: Handle form submission via AJAX (Fetch) to Formspree
form.addEventListener("submit", async function (event) {
// Stop the browser from attempting a default page reload/navigation
    event.preventDefault();
        
    // 1. Disable button and show loading state
    formBtn.setAttribute("disabled", "disabled");
    formBtn.querySelector("span").textContent = "Sending...";
    formStatus.classList.add('hidden'); // Hide status message during submission

    // 2. Prepare data for the fetch request
    const data = new FormData(event.target);
        
    try {
        // 3. Send data to the Formspree endpoint defined in the form's 'action' attribute
        const response = await fetch(event.target.action, {
            method: event.target.method,
            body: data,
            headers: {
                'Accept': 'application/json' // Crucial for getting a proper AJAX response from Formspree
            }
        });

        // 4. Handle response
        if (response.ok) {
            displayStatus("Thank you! Your message has been sent successfully. I will be in touch shortly.", false);
            form.reset(); // Clear the form fields after successful submission
            formBtn.setAttribute("disabled", ""); // Keep disabled after successful send and reset
        } else {
            // If the response is not OK (e.g., Formspree error)
            const responseData = await response.json();
            const errorMessage = responseData.error || "There was an issue submitting your form. Please try again later.";
            displayStatus(`Error: ${errorMessage}`, true);
        }

    } catch (error) {
        // Handle network errors (e.g., no internet connection)
        console.error("Fetch error:", error);
        displayStatus("Network error occurred. Please check your connection and try again.", true);
    } finally {
        // 5. Restore button text regardless of success or failure
        formBtn.querySelector("span").textContent = "Send Message";
    }
});

// Run on page load
document.addEventListener('DOMContentLoaded', renderAllData);