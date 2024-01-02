
let selectedItemName;
const REQUIRED_PROPERTIES = ['Name', 'Price', 'Specs', 'SupplierInfo', 'ProductionCompanyName', 'MadeIn', 'Rating'];

function createListItem(data) {
    const item = document.createElement("li");
    item.classList.add("aside__list--item");
    
    const itemInfo = document.createElement("div");
    itemInfo.classList.add("truncate-text");

    const title = document.createElement("h3");
    title.classList.add("title", "truncate-text");
    title.textContent = `${data.Name}`;

    const text = document.createElement("span");
    text.classList.add("little--text",  "truncate-text");
    text.textContent = `${data.Address}`;

    itemInfo.append(title, text);

    const itemSquare = document.createElement("div");
    itemSquare.classList.add("item-square");

    const countSquare = document.createElement("span");
    countSquare.textContent = `${data.FloorArea}`

    const textSquare = document.createElement("span");
    textSquare.classList.add("little--text",  "truncate-text");
    textSquare.textContent = "sq.m"

    itemSquare.append(countSquare, textSquare);
    item.append(itemInfo, itemSquare);
    console.log(item)
    return item;
}

function toggleEmptyList(active) {
    let empty = document.querySelector(".empty-list");
    if(active) {
        empty.classList.remove("inactive-list")
    } else {
        empty.classList.add("inactive-list")
    }
}

async function appendToList(item) {
    const itemName =  item.querySelector(".title").textContent;
   
    if(itemName === selectedItemName && selectedItemName !== undefined) {
        item.classList.add("item-active");
    }
    const list = document.querySelector(".aside__list");
    list.append(item);
}

function createList(data) {
    
    const items = document.querySelectorAll(".aside__list--item");
    items.forEach(el => el.remove());
    data.forEach((e) => {
        
        let item = createListItem(e);

        appendToList(item);
    })
};

function showEmptyPage() {
    const emptyPage = document.querySelector(".empty-product-wrapper");
    emptyPage.classList.add("active-wrapper");
    const productPage = document.querySelector(".product-wrapper");
    productPage.classList.remove("active-wrapper");
}

function separateName(name) {
    let result = name.replace(/([A-Z])/g, ' $1').trim().split('');
    result = result.map((el, id) => id !== 0 ? el.toLowerCase() : el).join("");
   
    return result;
}

function removeSpacesAndCapitalize(str) {
    var words = str.split(" ");
    for (var i = 0; i < words.length; i++) {
      words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
    }
    return words.join("");
}

function convertDate(date) {
    const year = date.substring(0, 4);
    const month = date.substring(5, 7);
    const day = date.substring(8, 10);
    const result = new Date(year, month - 1, day);

    return result.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function removeElementsByClassName(className) {
    let arr = document.querySelectorAll(className);
    arr.forEach(el => el.remove());
}

async function getSelectedData(item) {
    const itemName = item.querySelector(".title").textContent;
    
    const response = await makeAjaxGetRequest("http://localhost:3000/api/Stores");
    
    return  JSON.parse(response).find(el => el.Name === itemName);  
}

function showHeaderFilter(data) {
    const statuses = {
        "OUT_OF_STOCK": 0,
        "OK": 0,
        "STORAGE": 0
    }
    
   
    data.forEach((el) => {
        statuses[el.Status] += 1;
    })

    document.querySelector(".filterbar__btn-count").textContent = data.length;
    document.querySelector(".js-state-ok").textContent = statuses["OK"];
    document.querySelector(".js-state-storage").textContent = statuses["STORAGE"];
    document.querySelector(".js-state-out").textContent = statuses["OUT_OF_STOCK"];
}

function showHeaderInfo(data) {
    const productPage = document.querySelector(".product-wrapper");
    productPage.classList.add("active-wrapper");
    
    const emptyPage = document.querySelector(".empty-product-wrapper");
    emptyPage.classList.remove("active-wrapper");

    const requiredValues = Object.keys(data).filter(el => el !== 'Name' && el !== 'id' && el !== 'rel_Products');

    const info = document.querySelector(".header__info");
    removeElementsByClassName(".js-info-field");

    for(let item in data) {
        if(!requiredValues.includes(item)) {
            continue;
        } 
       
        const text = document.createElement('span');
        text.classList.add("truncate-text", "js-info-field"); 
        text.innerHTML = `
            <b>${separateName(item)}:</b> ${item === "Established" ? convertDate(data[item]) : data[item]}
        `
        text.setAttribute("title", text.textContent);
        info.append(text);
    }
}

function createRatingInTable(tableColumn, amountActiveStars) {
    const rating = document.createElement("div");
    rating.classList.add("rating");
       
    for(let i = 0; i < 5; i++) {
        const starIcon = document.createElement("i");
        starIcon.classList.add("fa-solid", "fa-star");
        if(i < amountActiveStars) {
            starIcon.classList.add("active-star");
        }
        rating.append(starIcon);
    }
    tableColumn.append(rating);
}

function filterData(data, requiredProperties) {
    return Object.keys(data)
    .filter(key => requiredProperties.includes(key))
    .reduce((fl, key) => {
        fl[key] = data[key];
        return fl;
    }, {});
}

function sortData(data, requiredProperties) {
    return requiredProperties.reduce((sorted, key) => {
        sorted[key] = data[key];
        return sorted;
    }, {});
}

function createColumn(tableRow, prodId, requiredProperties, data) {
    const name = 'Name';
    const price = 'Price';
    const rating = 'Rating';
    const imgCross = document.createElement("img");
    const imgEdit = document.createElement("img");
    const button = document.createElement("button");
    const btnsTd = document.createElement("td");
    const tdBlock = document.createElement("div");
    const buttonEdit = document.createElement("button");

    tdBlock.classList.add("product-btns");
    buttonEdit.classList.add("product-btn");
    button.classList.add("product-btn");
    button.addEventListener("click",(e) =>  {
        createDeletedProductPopup(tableRow);
        document.querySelector(".popup-wrapper").classList.remove("inactive-list");
    })
    buttonEdit.addEventListener("click", (e) => {
        createProductPopup(tableRow);
        document.querySelector(".popup-wrapper").classList.remove("inactive-list");
    })

    imgEdit.setAttribute("src", "/images/editIcon.png")
    imgCross.setAttribute("src", "/images/crossIcon.svg");
    imgCross.classList.add("icon")
    imgEdit.classList.add("icon");

    data = filterData(data, requiredProperties);
    data = sortData(data, requiredProperties);

    Object.keys(data).forEach(el => {
        if(!requiredProperties.includes(el)) return;
        
        const tableColumn = document.createElement("td");
        tableColumn.classList.add("truncate-text");
        
        switch(el) {
            case name: tableColumn.innerHTML = `<b>${data[el]}</b><br><span class='js-product-id'>${prodId}</span>`; break;
            case price: tableColumn.innerHTML = `<b>${data[el]}</b>\tusd`; break;
            case rating: createRatingInTable(tableColumn, data[el]); break;
            default: tableColumn.textContent = data[el]; break;
        }
        tableColumn.setAttribute("title", tableColumn.textContent);
        tableRow.append(tableColumn);
    })
    button.append(imgCross);
    buttonEdit.append(imgEdit);
    tdBlock.append(buttonEdit, button);
    btnsTd.append(tdBlock);
    tableRow.append(btnsTd)
}

function fillTable(data, requiredProperties) {
    
    removeElementsByClassName(".js-row-table");
    const table = document.querySelector(".table");
    if(!data.length) {
        document.querySelector(".empty-table").classList.remove("inactive-list");
    } else {
        document.querySelector(".empty-table").classList.add("inactive-list");
        data.forEach((el) => {
            const tableRow = document.createElement("tr");
            tableRow.classList.add("js-row-table");
            
            createColumn(tableRow, el.id, requiredProperties, el);
            
            table.append(tableRow);
        })
    } 
}

function createHeadersTable(requiredProperties) {
    const madeIn = "MadeIn";
    const productionCompanyName = "ProductionCompanyName";
    const headerForCross = document.createElement("th");
    const headerTable = document.querySelector(".table__subtitles");
    
    headerTable.innerHTML = "";
    
    requiredProperties.forEach(el => {
        const headerCol = document.createElement("th");
        headerCol.setAttribute("data-name", el);
       
        const name = document.createElement("span");
        switch(el) {
            case productionCompanyName: name.textContent = "Prod. company"; break;
            case madeIn: name.textContent = "Country of origin"; break;
            default : name.textContent = el;
        }

        const btn = document.createElement("button");
        btn.classList.add("sort-btn");

        const img = document.createElement("img");
        img.setAttribute("src", "/images/collapseIcon.png")
        img.classList.add("icon");

        btn.append(img);
        headerCol.append(name, btn);
        headerTable.append(headerCol);
    })
    headerTable.append(headerForCross);
}

function changeSearcherBtns() {
    const refreshBtn = document.querySelector(".refresh-btn");
    refreshBtn.classList.toggle("inactive-btn");

    const cancelBtn = document.querySelector(".cancel-btn");
    cancelBtn.classList.toggle("inactive-btn");
}

function makeAjaxGetRequest(url) {
    
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
            
        xhr.onload = function () {
            if(xhr.status === 400 || xhr.status === 404) {
                showEmptyPage();
                reject(xhr.response);
            } else {
                resolve(xhr.responseText);         
            }
        };
    
        xhr.onerror = () => {
            reject(xhr.response);
        }
        
        xhr.send();
    });
}

function makeAjaxPostRequest(url, data) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader("Content-Type", "application/json");
  
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          errorCallback(xhr.statusText);
          reject(xhr.statusText);
        }
      };
  
      xhr.onerror = function () {
        errorCallback(xhr.statusText);
        reject(xhr.statusText);
      };
  
      xhr.send(JSON.stringify(data));
    });
}

function makeAjaxDeleteRequest(url) {
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('DELETE', url, true);
  
      xhr.onload = function () {
        if(xhr.status === 400 || xhr.status === 404) {
            showEmptyPage();
        }

        if (xhr.status >= 200 && xhr.status < 300) {

          resolve(xhr.responseText);
        } else {
          reject(xhr.statusText);
        }
      };
  
      xhr.onerror = function () {

        reject(xhr.statusText);
      };
  
      xhr.send();
    });
}

function makeAjaxPutRequest(url, data) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
  
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          resolve(xhr.responseText);
        } else {
          reject(xhr.statusText);
        }
      };
  
      xhr.onerror = function() {
        reject(xhr.statusText);
      };
  
      xhr.send(JSON.stringify(data));
    });
}

function onError(responseText) {
    console.log(responseText);
    showEmptyPage();
}

function queryParamsSearchShops(val) {
    return {
        "where": {
            "or": [
                {
                    "Name": 
                    {
                        "ilike": val ? val : "."
                    } 
                },
                {
                    "Address": 
                    {
                        "ilike": val ? val : "."
                    } 
                },
                {
                    "FloorArea": 
                    {
                        "like": val ? val : "."
                    } 
                }
            ]
        }
    }
}

async function getCurrentItem() {
    const itemActive = document.querySelector(".item-active");
    let itemName = null;
    if(!itemActive) {
        return;
    } else {
        itemName = itemActive.querySelector(".title").textContent;
        const response = await makeAjaxGetRequest(`http://localhost:3000/api/Stores?filter[where][Name]=${itemName}`);
        return JSON.parse(response);
    }
}

async function sortTable(item) {
    const [currentItem] = await getCurrentItem();
    
    const rotatedBtns = document.querySelectorAll(".sort-btn-rotate");
    const arrowBtn = item.querySelector(".sort-btn");
    arrowBtn.classList.toggle("sort-btn-rotate");

    document.querySelectorAll(".js-sort__btn-active").forEach(el => el.classList.remove("js-sort__btn-active"));
    arrowBtn.classList.add("js-sort__btn-active");

    rotatedBtns.forEach(el => {
        if(el !== arrowBtn) {
            el.classList.remove("sort-btn-rotate");
        } 
    }) 

    const queryParams = encodeURIComponent(JSON.stringify(queryParamsProducts()));
    const URL = `http://localhost:3000/api/Stores/${currentItem.id}/rel_Products?filter=` + queryParams;
    
    return await makeAjaxGetRequest(URL);
}

function cleanAllFilters() {
    document.querySelector(".filterbar__btn-active")?.classList.remove("filterbar__btn-active");
    document.querySelector(".js-sort__btn-active")?.classList.remove("js-sort__btn-active");
    document.querySelector(".searcher-table .searcher__input").value = "";
}

function getFilterValue() {
    const filterBtn = document.querySelector(".filterbar__btn-active") || document.querySelector(".js-filterbar__btn-all");
    let filterValue = ".";

    const statuses = {
        ".": "js-filterbar__btn-all",
        "OK": "js-filterbar__btn-ok",
        "STORAGE": "js-filterbar__btn-storage",
        "OUT_OF_STOCK": "js-filterbar__btn-out"
    }

    for(let item in statuses) {
        if(filterBtn.classList.contains(statuses[item])) {
            filterValue = item
        }
    }
    return filterValue;
}

function getSortValue() {
    const sortBtn = document.querySelector(".js-sort__btn-active");
    let sortValue = "";
    let sortProperty = sortBtn?.closest(".table__subtitles th").textContent;
    
    if(!sortBtn) {
        sortValue = ".";
    } else if(sortBtn.classList.contains("sort-btn-rotate")) {
        sortValue = " DESC";
    } else {
        sortValue = " ASC";
    }

    switch(sortProperty) {
        case "Country of origin": sortProperty = "MadeIn"; break;
        case "Prod. company": sortProperty = "ProductionCompanyName"; break;
        case undefined: sortProperty = ""; break;
    }
    return [sortValue, sortProperty];
}

function queryParamsProducts() {
    const searcherValue = document.querySelector(".searcher-table .searcher__input").value;
    const [sortValue, sortProperty] = getSortValue();
    const filterValue = getFilterValue();

    return {
        "where": {
            "or": [ 
                {
                    "Name": {
                        "ilike": searcherValue ? searcherValue : "."
                    }
                },
                {
                    "ProductionCompanyName": {
                        "ilike": searcherValue ? searcherValue : "."
                    }
                },
                {
                    "Specs": {
                        "ilike": searcherValue ? searcherValue : "."
                    }
                },
                {
                    "Price": {
                        "like": searcherValue ? searcherValue : "."
                    }
                },
                {
                    "SupplierInfo": {
                        "ilike": searcherValue ? searcherValue : "."
                    }
                },
                {
                    "MadeIn": {
                        "ilike": searcherValue ? searcherValue : "."
                    }
                },
                {
                    "id": {
                        "like": searcherValue ? searcherValue : "."
                    }
                }
            ],
            "and": [
                {
                    "Status": {
                        "like": filterValue
                    }
                }
            ]
        },
        "order": `${sortProperty}${sortValue}` 
    }
}

function createShopPopup() {
    const shopProperty = ["Name", "Email", "Phone number", "Address", "Established date", "Floor area"];
    const popupContent = document.querySelector(".popup__content");
    const popupBtns = document.querySelector(".popup__btns")
    const btnCreate = document.createElement("button");    
    const title = document.createElement("h3");
    const popup = document.querySelector(".popup");

    title.classList.add("title", "popup__title");
    title.setAttribute("data-name", "createShop");
    title.textContent = "Create new shop";
    
    btnCreate.classList.add("popup-btn", "popup-createShop", "js-btn-change");
    btnCreate.textContent = "Create";
    popupBtns.prepend(btnCreate);
    popup.prepend(title);

    shopProperty.forEach((el) => {
        const inputBlock = document.createElement("div");
        const text = document.createElement("span");
        const input = document.createElement("input");
        switch(el) {
            case "Established date": input.setAttribute("type", "date"); break;
            case "Email": input.setAttribute("data-type", "js-mail-popup"); break;
            case "Phone number": 
            case "Floor area": input.setAttribute("data-type", "js-number-popup"); break;
        }
        inputBlock.classList.add("popup__inputs");
        text.textContent = el;
        input.setAttribute("data-name", removeSpacesAndCapitalize(el));
        input.classList.add("js-property-popup");
        inputBlock.append(text, input);
        popupContent.append(inputBlock);
    })
}

function createSelectInPopup() {
    const statuses = ["OK", "OUT_OF_STOCK", "STORAGE"];
    const status = document.createElement("select");
    statuses.forEach((el) => {
        const option = document.createElement("option");
        option.textContent = el;
        status.append(option);
    })
        
    return status;
}

async function fillEditPopup(popupContent, tableRow) {
    const productId = tableRow.querySelector(".js-product-id").textContent;
    const properties = Array.from(popupContent.querySelectorAll(".js-property-popup"));
    const URL = `http://localhost:3000/api/Products/${productId}`;
    const responseProduct = JSON.parse(await makeAjaxGetRequest(URL));     
    const sortedData = sortData(responseProduct, REQUIRED_PROPERTIES);
    Object.keys(sortedData).forEach((el, id) => {
        if(id === 0) {
            properties[id].setAttribute("data-id", productId);
            properties[id].setAttribute("data-storeId", responseProduct.StoreId);
        }
        properties[id].value = sortedData[el];
    })
    properties[properties.length - 1].value = responseProduct.Status;
}

function createProductPopup(tableRow = null) {
    const shopProperty = ["Name", "Price", "Specs", "Supplier info","Production company name", "Made in", "Rating", "Status"];
    const popupContent = document.querySelector(".popup__content");
    const popupBtns = document.querySelector(".popup__btns")
    const btnCreate = document.createElement("button");
    const title = document.createElement("h3");
    const popup = document.querySelector(".popup");
    
    title.classList.add("title", "popup__title");
    title.setAttribute("data-name", "createProduct");
    
    popupBtns.prepend(btnCreate);
    popup.prepend(title);

    shopProperty.forEach((el) => {
        const inputBlock = document.createElement("div");
        const text = document.createElement("span");
        let input;
        
        switch(el) {
            case "Supplier info":
            case "Specs": input = document.createElement("textarea"); break;
            case "Status": input = createSelectInPopup(); break;
            case "Price": input = document.createElement("input"); input.setAttribute("data-type", "js-number-popup"); break;
            case "Rating": {
                input = document.createElement("input"); 
                input.setAttribute("data-type", "js-rating-popup"); 
                input.classList.add("js-rating-popup"); break;
            } 
            default: input = document.createElement("input"); break;
        }
        inputBlock.classList.add("popup__inputs");
        text.textContent = el;
        input.setAttribute("data-name", removeSpacesAndCapitalize(el));
        input.classList.add("js-property-popup");
        inputBlock.append(text, input);
        if(el === "Price") {
            input.classList.add("js-price-popup");
            const denomination = document.createElement("span");
            denomination.textContent = "USD";
            denomination.classList.add("js-denomination");
            inputBlock.append(denomination);
        }
        popupContent.append(inputBlock);
    })

    if(tableRow) {
        title.textContent = "Edit product";
        btnCreate.classList.add("popup-btn", "popup-editProduct", "js-btn-change");
        btnCreate.textContent = "Edit";
        fillEditPopup(popupContent, tableRow);
    } else {
        title.textContent = "Create new product";
        btnCreate.classList.add("popup-btn", "popup-createProduct", "js-btn-change");
        btnCreate.textContent = "Create";
    }
}

function createDeletedShopPopup() {
    const popupBtns = document.querySelector(".popup__btns")
    const btnCreate = document.createElement("button");
    const title = document.createElement("h3");
    const popup = document.querySelector(".popup");
    const text = document.createElement("span");

    title.classList.add("title", "popup__title");
    title.setAttribute("data-name", "deleteShop");
    title.textContent = "delete shop";
    text.textContent = "Are you sure?";
    
    btnCreate.classList.add("popup-btn", "popup-confirm", "js-btn-change");
    btnCreate.textContent = "confirm";
    popupBtns.prepend(btnCreate);
    popup.prepend(text);
    popup.prepend(title)
}

function createDeletedProductPopup(tableRow) {
    const popupBtns = document.querySelector(".popup__btns")
    const btnCreate = document.createElement("button");
    const title = document.createElement("h3");
    const popup = document.querySelector(".popup");
    const productId = tableRow.querySelector(".js-product-id").textContent;
    const text = document.createElement("span");

    title.classList.add("title", "popup__title");
    title.setAttribute("data-id", productId);
    title.textContent = "delete product";
    text.textContent = "Are you sure?";
    
    btnCreate.classList.add("popup-btn", "popup-confirm-product", "js-btn-change");
    btnCreate.textContent = "confirm";
    popupBtns.prepend(btnCreate);
    if(!popup.querySelector("span")) {
        popup.prepend(text);
    }
  
    popup.prepend(title);
}

function cleanPopup() {
    const popupContent = document.querySelector(".popup__content");
    document.querySelector(".js-btn-change")?.remove();
    document.querySelector(".popup__title")?.remove();
    popupContent.innerHTML = "";
}

async function deleteProduct() {
    const productId = document.querySelector(".popup__title").getAttribute("data-id");
    
    const [currentItem] = await getCurrentItem();
    await makeAjaxDeleteRequest(`http://localhost:3000/api/Products/${productId}`);
    
    const currentProducts = await makeAjaxGetRequest(`http://localhost:3000/api/Stores/${currentItem.id}/rel_Products`);
    showHeaderFilter(JSON.parse(currentProducts));
    fillTable(JSON.parse(currentProducts), REQUIRED_PROPERTIES);
}

async function generatePage() {
    
    const response = await makeAjaxGetRequest("http://localhost:3000/api/Stores");
 
    createList(JSON.parse(response));
};

async function headerSearcher(e) {
    const val = e.target.value.trim();
    const queryParams = encodeURIComponent(JSON.stringify(queryParamsSearchShops(val)));
    const URL = "http://localhost:3000/api/Stores?filter=" + queryParams;

    const responseData = await makeAjaxGetRequest(URL);
    
    createList(JSON.parse(responseData));

    if(!JSON.parse(responseData).length) {
        toggleEmptyList(true);  
    } else {
        toggleEmptyList(false);
    }
}

async function cleanHeaderSearcher(e) {
    const inputHeader = document.querySelector(".js-input-header");
    inputHeader.value = '';
    const responseData = JSON.parse(await makeAjaxGetRequest("http://localhost:3000/api/Stores/"));

    toggleEmptyList(false);
    createList(responseData);
}

async function chooseItem(e) {
    if(e.target.closest(".empty-list")) {
        return;
    } 
    cleanAllFilters();
    const item = e.target.closest('.aside__list--item');
    const itemName = item.querySelector(".title").textContent;
    if(item.classList.contains("item-active")) {
        item.classList.remove("item-active");

        selectedItemName = null;
        
        showEmptyPage();
    } else {
        const items = document.querySelectorAll('.aside__list--item');
        items.forEach((el) => el.classList.remove("item-active"))
        item.classList.add("item-active");
        
        selectedItemName = itemName;
        let data = await getSelectedData(item);

        const responseData = await makeAjaxGetRequest(`http://localhost:3000/api/Stores/${data.id}/rel_Products`);

        showHeaderInfo(data);
        showHeaderFilter(JSON.parse(responseData));
        createHeadersTable(REQUIRED_PROPERTIES);
   
        fillTable(JSON.parse(responseData), REQUIRED_PROPERTIES);
    }
    handleBookmarkClick(e);
}

async function tableSearcher() {

    const [currentItem] = await getCurrentItem();
    const queryParams = encodeURIComponent(JSON.stringify(queryParamsProducts()));
    const URL = `http://localhost:3000/api/Stores/${currentItem.id}/rel_Products?filter=` + queryParams;
    const responseProducts = await makeAjaxGetRequest(URL);

    fillTable(JSON.parse(responseProducts), REQUIRED_PROPERTIES);
}

function addRequiredMessage(field) {
    if(field.parentNode.querySelector(".required")) {
        return;
    }

    let requiredSpan = document.createElement('span');
    requiredSpan.classList.add('required');
    requiredSpan.innerHTML = 'Required field*';
    
    field.value = field.value.trim();
    field.parentNode.querySelector(".valid-mail")?.remove();
    field.parentNode.append(requiredSpan);
    
}

async function handleFilter(e) {
    
    const filterBtn = e.target.closest(".filterbar__btn");
    if(!filterBtn) return;

    document.querySelectorAll(".filterbar__btn").forEach(el => el.classList.remove("filterbar__btn-active"));

    filterBtn.classList.add("filterbar__btn-active");

    const [currentItem] = await getCurrentItem();
    const queryParams = encodeURIComponent(JSON.stringify(queryParamsProducts()));
    const URL = `http://localhost:3000/api/Stores/${currentItem.id}/rel_Products?filter=` + queryParams;
    const responseProducts = await makeAjaxGetRequest(URL);


    fillTable(JSON.parse(responseProducts), REQUIRED_PROPERTIES);
}

function validateProperty(el, regex, message, validClass) {
    const requiredSpan = document.createElement('span');

    if(el.parentNode.querySelector(".required")) {
        return;
    }

    if(regex.test(el.value)) {
        if(el.parentNode.querySelector("." + validClass)) {
            el.parentNode.querySelector("." + validClass).remove();
            
        }

    } else {
        if(el.parentNode.querySelector("." + validClass)) {
            return;
        }
        requiredSpan.classList.add(validClass);
        requiredSpan.innerHTML = message;
        
        el.value = el.value.trim();
        
        el.parentNode.append(requiredSpan);
    }
}

async function submitCreateShopPopup(properties) {
    const validProperties = {
        mail: "js-mail-popup",
        number: "js-number-popup"   
    };
    const regMail = /^[\w.-]+@[\w.-]+(\.\w+)+$/;
    const regNumber = /^\d+$/;

    properties.forEach((el) => {
        if(!el.value.trim()) {
            addRequiredMessage(el);
            return;
        } else {
            if(el.parentNode.querySelector('.required')) el.parentNode.querySelector('.required').remove();
        }
        switch(el.getAttribute("data-type")) {
            case validProperties.mail: validateProperty(el, regMail, "invalid entry*", "valid-mail"); break;
            case validProperties.number: validateProperty(el, regNumber, "should be number*", "valid-number"); break;
        }
    })
  
    if(document.querySelector(".required") || document.querySelector(".valid-number") || document.querySelector(".valid-mail")) {
        return;
    } else {
        const data = {};
        properties.forEach((el) => {
            const property = el.getAttribute("data-name");
            const value = el.value; 
            data[property] = value;
        })
        data.Price = Number(data.Price);
        data.Rating = Number(data.Rating);
        await makeAjaxPostRequest(`http://localhost:3000/api/Stores`, data);
        cleanPopup();
        reloadPage();    
    }
}

async function submitCreateProductPopup(currentItem, properties, isEditer = false) {
    const data = {};
    const validProperties = {
        rating: "js-rating-popup",
        number: "js-number-popup"   
    };
    const regRating = /^[1-5]$/;
    const regNumber = /^\d+$/;
    properties.forEach((el) => {
        const property = el.getAttribute("data-name");
        const value = el.value; 
        data[property] = value;
    })
    
    properties.forEach((el) => {
        if(!el.value.trim()) {
            addRequiredMessage(el);
            return;
        } else {
            if(el.parentNode.querySelector('.required')) el.parentNode.querySelector('.required').remove();
        }
         switch(el.getAttribute("data-type")) {
            case validProperties.rating: validateProperty(el, regRating, "number must be from 1 to 5*", "valid-rating"); break;
            case validProperties.number: validateProperty(el, regNumber, "should be number*", "valid-number"); break;
        }
    })

    if(document.querySelector(".required") || document.querySelector(".valid-rating") || document.querySelector(".valid-number")) {
        return;
    } else {
        if(!isEditer) {
            data.Price = Number(data.Price);
            data.Rating = Number(data.Rating);
            await makeAjaxPostRequest(`http://localhost:3000/api/Stores/${currentItem.id}/rel_Products`, data);
        } else {
            const popupProperties = document.querySelectorAll(".js-property-popup");
            let productId = null;
            let storeId = null;
            popupProperties.forEach(el => {
                if(el.getAttribute("data-id")) {
                    productId = el.getAttribute("data-id");
                    storeId = el.getAttribute("data-storeId");
                }
            })
            data.StoreId = Number(storeId);
            data.id = Number(productId);
            await makeAjaxPutRequest(`http://localhost:3000/api/Products/${productId}`, data);
        }
        
        const response = await makeAjaxGetRequest(`http://localhost:3000/api/Stores/${currentItem.id}/rel_products`);
        showHeaderFilter(JSON.parse(response));
        fillTable(JSON.parse(response), REQUIRED_PROPERTIES);
        reloadPage()
        cleanPopup();
    }
}

async function submitDeleteShopPopup(currentItem) {
    const URL = `http://localhost:3000/api/Stores/${currentItem.id}`;
    await makeAjaxDeleteRequest(URL);
    cleanPopup();

    selectedItemName = null;
    showEmptyPage();
    await generatePage()
}

async function reloadPage() {
    document.querySelector(".popup-wrapper").classList.add("inactive-list");
    await generatePage();
}

function searchCurrentItemTemplate(item) {
 
    const items = document.querySelectorAll('.aside__list--item');
    let itemTamplate;
    items.forEach((el) => {
        const name = el.querySelector(".title").textContent;
        if(item.Name === name) {
            itemTamplate = el;
        }
    })
 
    items.forEach((el) => el.classList.remove("item-active"))
    itemTamplate.classList.add("item-active");
   
}

async function submitPopups(e) {
    e.preventDefault();
    const properties = [...e.target.querySelectorAll(".js-property-popup")];
    const [currentItem] = await getCurrentItem() ?? [];
    if(document.querySelector(".popup-createShop")) {
        submitCreateShopPopup(properties);
       
    } else if(document.querySelector(".popup-confirm")){
        submitDeleteShopPopup(currentItem);
        reloadPage();
    } else if(document.querySelector(".popup-confirm-product")) {
        deleteProduct();
        cleanPopup();
        reloadPage();
    } else if(document.querySelector(".popup-editProduct")) {
        submitCreateProductPopup(currentItem, properties, true);
    } else {
        submitCreateProductPopup(currentItem, properties);
    }
}

async function handleBookmarkClick(e) {
    if(!await getCurrentItem()) {
        location.hash = 0;
        return
    } 
    const [currentItem] = await getCurrentItem();
    const isBookmarked = location.hash.includes(currentItem.id);
    
    if (isBookmarked) {
        const updatedHash = location.hash.replace(currentItem.id, '');
        location.hash = updatedHash;
      } else {
        location.hash = currentItem.id;
    }
    
}


generatePage();

document.querySelector(".aside__list").addEventListener('click', (e) => chooseItem(e));

document.querySelector(".js-input-header").addEventListener("change", (e) => headerSearcher(e));

document.querySelector(".js-input-header").addEventListener("focus", (e) => changeSearcherBtns());

document.querySelector(".js-input-header").addEventListener("blur", (e) => changeSearcherBtns());

document.querySelector(".cancel-btn").addEventListener("mousedown", (e) => cleanHeaderSearcher(e));

document.querySelector(".searcher-table").addEventListener("change", tableSearcher);

document.querySelector(".table__subtitles").addEventListener("click", async (e) => {
    e.preventDefault();
    const item = e.target.closest('.table__subtitles th');
    const data = await sortTable(item);
    
    fillTable(JSON.parse(data), REQUIRED_PROPERTIES);
    
})

document.querySelector(".header__filter").addEventListener("click", (e) => handleFilter(e));

document.querySelector(".popup").addEventListener("submit", async (e) => submitPopups(e));

document.querySelector(".btn-create").addEventListener("click", (e) => {
    createProductPopup();
    document.querySelector(".popup-wrapper").classList.remove("inactive-list");
})

document.querySelector(".aside-create").addEventListener("click", (e) => {
   
    createShopPopup();
    document.querySelector(".popup-wrapper").classList.remove("inactive-list");
})

document.querySelector(".popup-cancel").addEventListener("click", (e) => {
    e.preventDefault();
    
    cleanPopup();
    document.querySelector(".popup-wrapper").classList.add("inactive-list");
})

document.querySelector(".btn-delete").addEventListener("click", (e) => {
    createDeletedShopPopup();
    document.querySelector(".popup-wrapper").classList.remove("inactive-list");
})

window.addEventListener('hashchange', async function(e) {
    
    const regexNumber = /\d+/;
    const str = this.location.hash;
    const currentId = str.match(regexNumber);
    if(!currentId && !str) {
        return
    }
    try {
      
        const currentItem = await makeAjaxGetRequest(`http://localhost:3000/api/Stores/${currentId}`);
        const currentProducts = await makeAjaxGetRequest(`http://localhost:3000/api/Stores/${currentId}/rel_Products`);
        
        searchCurrentItemTemplate(JSON.parse(currentItem))
        showHeaderInfo(JSON.parse(currentItem));
        showHeaderFilter(JSON.parse(currentProducts));
        createHeadersTable(REQUIRED_PROPERTIES);
    
        fillTable(JSON.parse(currentProducts), REQUIRED_PROPERTIES);
    }catch (e){
      
        showEmptyPage()
    }
});

function View() {

}

function Model() {

}

function Controller() {

}

/* (new Controller(new View(), new Model())).init(); */