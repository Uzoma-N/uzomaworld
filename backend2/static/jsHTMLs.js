/**
 * This section helps to populate the html syntaxes
 * 
 * 
 * 
 * Creates the HTML structure for a single CV item.
 * @param {Object}  - The certification data object.
 * @returns {string} The HTML string for the item.
 */


export function createCertificationHTML(cert) {
    //console.log("Skill Data Array:", cert.title);
    let part_2 = ''
    const part_1 =   `
                    <div class="certification-item active" data-category="${cert.category}" id="cert-${cert.category}">                        
                        <h4 class="h4 timeline-item-title"> ${cert.certTitle} </h4>  
                        <span class="timeline-text"> ${cert.endDate} </span>                   
                        <div class="link">
                            <a href="${cert.link}" target="_blank">View Certification Link</a>
                        </div>  
                        <div class="category">  `
                        
    const part_3 =         `
                            </div>
                        </div>  `

    cert.category.forEach(cat => {
        if (cat !== ''){
            part_2 += assignCategory(cat);
        };
    })
    ;
    return `${part_1} ${part_2} ${part_3}`
}

export function createEducationHTML(education) {
    return `
        <li class="timeline-item">
                <div class="degree-header">
                  <h4 class="h4 timeline-item-title">
                    ${education.schoolName}
                  </h4>
                  <span>${education.startDate} — ${education.endDate}</span>
                </div>

                <p class="timeline-text">
                  ${education.degreeTitle}
                </p>
                <div class="degree-detail">
                  <ion-icon
                    class="socials-icons"
                    name="location-outline"
                  ></ion-icon>
                  <p class="timeline-text">${education.city}, ${education.country}</p>
                </div>
                <div class="degree-detail">
                  <ion-icon
                    class="socials-icons"
                    name="school-outline"
                  ></ion-icon>
                  <p class="timeline-text">
                    ${education.grade} (${education.gradeVal})
                  </p>
                </div>
              </li>
    `;
}

export function createProjectFilterHTML(filter) {
    return `
                <li class="filter-item">
                    <button data-filter-btn>${filter.main}</button>
                </li>
    `;
}

export function createProjectSelectHTML(filter) {
    return `
                <li class="select-item">
                  <button data-select-item>${filter.main}</button>
                </li>
    `;
}

export function createServiceHTML(service) {

    return `
                <li class="service-item">
                    <div class="service-icon-box">
                    <img
                        src="static/${String(service.serviceImage).replace(/^\//, '')}"
                        alt="${service.serviceTitle}"
                        width="40"
                    />
                    </div>

                    <div class="service-content-box">
                    <h4 class="h4 service-item-title">
                        ${service.serviceTitle}
                    </h4>

                    <p class="service-item-text">
                        ${service.serviceText}
                    </p>
                    </div>
                </li>
    `;
}

export function createSocialHTML(social) {
    
    return `
                <li class="social-item">
                    <a
                        href="${social.socialLink}"
                        class="social-link"
                    >
                        <ion-icon class="socials-icons" name="logo-${social.socialType[0].toLowerCase()}"></ion-icon>
                    </a>
                </li>
    `;
}

export function createCatHTML(cat) {
    
    return `
                <label class="category-item">
                    <input type="checkbox" data-value="${cat.main.toLowerCase()}">
                    <span>${cat.main}</span>
                </label> `;
}


export function createExperienceHTML(experience) {

    // Join all strings with the HTML line break tag
    // const htmlString = dutiesArray.join('<br>');
    let part_3 = ''
    let part_6 = ''
    const part_1 =      `
                        <li class="exp-timeline-item active" data-category="${experience.category}">
                            <div class="degree-header">
                                <h4 class="h4 timeline-item-title">                    
                                    ${experience.workTitle}
                                </h4>
                                <span>${experience.startDate} — ${experience.endDate}</span>
                            </div>

                            <p class="timeline-text">                  
                                ${experience.industryName} - ${experience.city}, ${experience.country}
                            </p> `
    const part_2 =      `
                            <div class="category">   `
    const part_4 =      `     
                            </div>       `

    const part_5 =      `
                            <ul class="work-text">  `

    const part_7 =     `  
                            </ul>
                        </li> `
    
    experience.category.forEach(cat => {
        if (cat !== '') {
            part_3 += assignCategory(cat);
        };
    })

    experience.dutyDescription.forEach(duty => {
        part_6 += createDuties(duty);
    
    });
    // return `${part_1}, ${part_2}, ${part_3}, ${part_4}, ${part_5} ${part_6}, ${part_7}`  ;

    if (part_3 !== '' ) {
        return `${part_1} ${part_2} ${part_3} ${part_4} ${part_5} ${part_6} ${part_7}` ;
    } else{
        return `${part_1} ${part_5} ${part_6} ${part_7}`  ;
    };
}   

export function createSkillHTML(skill) {

    // Join all strings with the HTML line break tag
    // const htmlString = dutiesArray.join('<br>');
    let part_3 = ''
    //console.log("Skill Data Array:", skill.skillTitle);

    // skills divided into sub-skills show "<b>title</b>: description" per sub-skill instead of their own description
    const skillText = (skill.skillParts && skill.skillParts.length > 0)
        ? skill.skillParts.map(part => `<b>${part.title}</b>: ${part.description}`).join('<br>')
        : skill.skillDescription;

    const part_1 =      `
                            <li class="skills-item active" data-category="${skill.category}" data-skill-group="${skill.typename}">
                                <div class="title-wrapper">
                                    <h5 class="h5">${skill.skillTitle}</h5>
                                    <data value="${skill.percentage}">${skill.percentageScore}</data>
                                </div>
                                <p class="skill-text">
                                    ${skillText}
                                </p>   `
    const part_2 =      `
                                <div class="category">   `

    const part_4 =      `        
                                </div> `
    const part_5 =      `                         
                                <div class="skill-progress-bg">
                                    <div class="skill-progress-fill" style="width: ${skill.percentageScore}"></div>
                                </div>
                                </li>  `
    
    skill.category.forEach(cat => {
        if (cat !== ''){
            part_3 += assignCategory(cat);
        };
    });

    // return `${part_1} ${part_2} ${part_3}` ;

    if (part_3 !== '' ) {
        return `${part_1} ${part_2} ${part_3} ${part_4} ${part_5}` ;
    } else{
        return `${part_1} ${part_5}` ;
    };
}

export function createProjectHTML(project, status) {

    // Join all strings with the HTML line break tag
    // const htmlString = dutiesArray.join('<br>');
    let part_3 = ''
    //console.log("Skill Data Array:", project.projectTitle);  
    
    const part_1 =      `
                               <li
                                    class="project-item ${status}"
                                    data-filter-item
                                    data-clas="${project.projectClass[0].toLowerCase()}"
                                    data-category="${project.category}"
                                >
                                    <a href="${project.projectLink}">         

                                        <h3 class="project-title">
                                                ${project.projectTitle}
                                        </h3>

                                        <p class="project-category">${project.projectClass}</p>
                                        <p class="port-text">
                                            ${project.projectDescription}
                                        </p> `

    const part_2 =      `
                                        <div class="category">   `
    
    const part_4 =      `        
                                        </div> `

    const part_5 =      `
                                    </a>
                                </li>  `

    project.category.forEach(cat => {
        if (cat !== ''){
            part_3 += assignCategory(cat);
        };
    });

    if (part_3 !== '' ) {
        return `${part_1} ${part_2} ${part_3} ${part_4} ${part_5}` ;
    } else{
        return `${part_1} ${part_5}` ;
    };
}

function createDuties(duty) {
    return `
        <li>
            <p class="timeline-text">
                ${duty}
            </p>
        </li>
    `;
}

function assignCategory(cat) {
    return `        
                                        <div class="category-tag ${cat}">${cat}</div>  `;
}

// Template for a dynamic Work Experience entry
const workTemplate = (index) => `
        <div class="p-4 border border-indigo-200 rounded-lg bg-indigo-50 relative" data-index="${index}">
            <h4 class="text-md font-bold mb-3 text-indigo-700">Work Entry #${index + 1}</h4>
            <button type="button" class="remove-entry absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg">&times;</button>
            
            <div class="grid sm:grid-cols-2 gap-4">
                <div class="form-group">
                    <label for="work-title-${index}" class="block text-sm font-medium text-gray-700">Job Title *</label>
                    <input type="text" id="work-title-${index}" name="workTitle" data-type="work" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                <div class="form-group">
                    <label for="work-company-${index}" class="block text-sm font-medium text-gray-700">Company Name *</label>
                    <input type="text" id="work-company-${index}" name="workCompany" data-type="work" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                <div class="form-group">
                    <label for="work-city-${index}" class="block text-sm font-medium text-gray-700">City (Optional)</label>
                    <input type="text" id="work-city-${index}" name="workCity" data-type="work" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                <div class="form-group">
                    <label for="work-country-${index}" class="block text-sm font-medium text-gray-700">Country (Optional)</label>
                    <input type="text" id="work-country-${index}" name="workCountry" data-type="work" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                <div class="form-group">
                    <label for="work-start-${index}" class="block text-sm font-medium text-gray-700">Start Date (YYYY-MM) *</label>
                    <input type="month" id="work-start-${index}" name="workStart" data-type="work" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                <div class="form-group">
                    <label for="work-end-${index}" class="block text-sm font-medium text-gray-700">End Date (YYYY-MM) *</label>
                    <input type="month" id="work-end-${index}" name="workEnd" data-type="work" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
            </div>
            
            <div class="form-group">
                <label for="work-desc-${index}" class="block text-sm font-medium text-gray-700">Key Responsibilities (Optional)</label>
                <textarea id="work-desc-${index}" name="workDesc" data-type="work" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500"></textarea>
            </div>
        </div>
`;

    // Template for a dynamic Education entry
const educationTemplate = (index) => `
        <div class="p-4 border border-purple-200 rounded-lg bg-purple-50 relative" data-index="${index}">
            <h4 class="text-md font-bold mb-3 text-purple-700">Education Entry #${index + 1}</h4>
            <button type="button" class="remove-entry absolute top-2 right-2 text-red-500 hover:text-red-700 text-lg">&times;</button>

            <div class="form-group">
                <label for="edu-degree-${index}" class="block text-sm font-medium text-gray-700">Degree/Certification *</label>
                <input type="text" id="edu-degree-${index}" name="eduDegree" data-type="education" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div class="form-group">
                <label for="edu-institution-${index}" class="block text-sm font-medium text-gray-700">Institution Name *</label>
                <input type="text" id="edu-institution-${index}" name="eduInstitution" data-type="education" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
            </div>
            <div class="grid sm:grid-cols-3 gap-4">
                <div class="form-group">
                    <label for="edu-city-${index}" class="block text-sm font-medium text-gray-700">City (Optional)</label>
                    <input type="text" id="edu-city-${index}" name="eduCity" data-type="education" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                <div class="form-group">
                    <label for="edu-country-${index}" class="block text-sm font-medium text-gray-700">Country (Optional)</label>
                    <input type="text" id="edu-country-${index}" name="eduCountry" data-type="education" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
                <div class="form-group">
                    <label for="edu-year-${index}" class="block text-sm font-medium text-gray-700">Graduation Year (YYYY) *</label>
                    <input type="number" id="edu-year-${index}" name="eduYear" data-type="education" required min="1900" max="2100" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500">
                </div>
            </div>
        </div>
`;

/**
 * JavaScript notation/functionality: Filters the displayed items 
 * based on the selected category.
 
function filterCertifications() {
    // 1. Get the selected value
    const selector = document.getElementById('category-select');
    const selectedCategory = selector.value;
    
    // 2. Get all certification items
    const certItems = document.querySelectorAll('.certification-item');
    
    // 3. Iterate and show/hide
    certItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        
        // Log the filtering action (JavaScript Notation)
        console.log(`Filtering: Selected=${selectedCategory}, Item=${itemCategory}`);

        // Logic: Show if 'All' is selected, or if the item's category matches the selection
        if (selectedCategory === 'All' || itemCategory === selectedCategory) {
            item.style.display = 'flex'; // Use 'flex' since that's what's in the CSS
        } else {
            item.style.display = 'none';
        }
    });
    
    // Additional JavaScript Notation: Provides feedback to the user
    // alert(`Now viewing: ${selectedCategory} certifications.`);

  ===========================
    <div class="filters">
            <label for="category-multiselect-list" class="filter-label"
              >Select Category</label
            >
            <div id="category-multiselect-list" class="custom-select">
              <div class="select-box" tabindex="0">
                <span class="selected-cats-display">Category</span>
                <div class="arrow"></div>
              </div>
              <ul id="cat-options-list" class="options-list"></ul>
            </div>

            <!--<select id="cat-list" class="arrow-icon"></select>-->
          </div>

          repeat(2, 1fr)

          ========================================
          <li class="contact-item">
              <div class="icon-box">
                <ion-icon name="mail-outline"></ion-icon>
              </div>

              <div class="contact-info">
                <p class="contact-title">Email</p>

                <a
                  href="mailto:{{ json_data.Details[0].emailAddress }}"
                  class="contact-link"
                  >{{ json_data.Details[0].emailAddress }}</a
                >
              </div>
            </li>

            <li class="contact-item">
              <div class="icon-box">
                <ion-icon name="phone-portrait-outline"></ion-icon>
              </div>

              <div class="contact-info">
                <p class="contact-title">Phone</p>

                <a
                  href="tel:{{ json_data.Details[0].phoneNumber }}"
                  class="contact-link"
                  >{{ json_data.Details[0].phoneNumber }}</a
                >
              </div>
            </li>

            <li class="contact-item">
              <div class="icon-box">
                <ion-icon name="calendar-outline"></ion-icon>
              </div>

              <div class="contact-info">
                <p class="contact-title">Birthday</p>

                <time datetime="1992-08-14"
                  >{{ json_data.Details[0].dob }}</time
                >
              </div>
            </li>

            <li class="contact-item" >
              <div class="icon-box">
                <ion-icon name="location-outline"></ion-icon>
              </div>

              <div class="contact-info">
                <p class="contact-title">Location</p>

                <address>{{ json_data.Details[0].address }}</address>
              </div>
            </li>

             <label for="profile-select" class="filter-label"
                  >Select Profile:</label
                >

}*/

