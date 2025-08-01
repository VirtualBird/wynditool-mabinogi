import {ingredientsData} from './cookingdata.js'

const mainEl = document.getElementById("main")
const itemListEl = document.getElementById("item-list")
const itemSearchEl = document.getElementById("item-search")
const itemDetailsEl = document.getElementById("item-details")

const checkboxByName = document.getElementById("by-name")
const checkboxByIngredient = document.getElementById("by-ingredient")

itemSearchEl.addEventListener("input", updateSearch)
checkboxByName.addEventListener('change', updateSearch)
checkboxByIngredient.addEventListener('change', updateSearch)

document.addEventListener('click', function(e){
    // if (e.target.classList.contains('search-name'))
    // {
    //     displayMainItem(e.target.textContent)
    // }
    if (e.target.classList.contains('search-name') && e.target.dataset.name)
    {
        displayMainItem(e.target.dataset.name)
        document.getElementById("item-selected-details").classList.remove("hidden")
        document.getElementById("cooking-window-mockup").classList.remove("hidden")
    }
    else if (e.target.dataset.name)
    {
        displaySelectedItem(e.target.dataset.name)
    }

    console.log(e.target)
})


// Displays the details of the selected item
function displayMainItem(itemName)
{
    let detailsHTML = ''
    if (itemName)
    {
        const itemObj = ingredientsData.find(function(item)
        {
            // return item.name.includes(itemName)
            return item.name === itemName
        })
        detailsHTML = ` <h2>${itemObj.name}</h2>`

        const itemMethod = itemObj?.method ?? ''
        if (itemMethod)
        {
            detailsHTML += `<p>${itemMethod} (${getCookingRankByMethod(itemMethod)} Cooking)</p>`
        }
        // So here I want to get the highest rank needed for the rest of these main recipe's ingredients just in case and put it here
        
        const rankNameForAll = getRequiredCookingRankAll(itemObj)
        console.log("Actual Rank from all ingredients for this recipe")
        
        console.log(getRequiredCookingRankAll(itemObj))
        console.log(getCookingRankByMethod(itemMethod))

        

        //  Don't show warning message on items that can't be cooked
        if (isIngredientRankHigherThanMainDish(0, getCookingRankByMethod(itemMethod)))
        {
            console.log("Test")
            if (isIngredientRankHigherThanMainDish(getCookingRankByMethod(itemMethod), getRequiredCookingRankAll(itemObj)))
            {
                detailsHTML +=`<p>*${rankNameForAll} Cooking is required for ${getMethodbyCookingRank(rankNameForAll)}</p>`
            }
        }

        //  If recipe parameter exists
        if (itemObj?.recipe)
        {
            const recipeHtml = itemObj.recipe.map(function(item){
                return `<li>${item.name} (${item.percent}%)</li>`
            }).join('')

            detailsHTML +=  `
                <div>
                    <p>Main Ingredients</p>
                    <ul>${recipeHtml}</ul>
                </div>`

            const percentArr = itemObj.recipe.map(function(item){
                return item.percent
            })

            setCookingBarPercentages(percentArr[0], percentArr[1], percentArr[2])
        }
        //  fallback to old ingredients code
        else if (itemObj?.ingredients)
        {
            detailsHTML +=  `
                            <div>
                            <p>Main Ingredients</p>
                            <p>${itemObj.ingredients}</p>
                            </div>`

            setCookingBarPercentages(0)
        }

        if (itemObj?.purchase)
        {
            detailsHTML += `
                            <div>
                            <p>Purchase from</p>
                            <p>${itemObj.purchase}</p>
                            </div>`
        }

        if (itemObj?.price)
        {
            detailsHTML += `
                            <div>
                            <p>Price</p>
                            <p>${itemObj.price}g</p>
                            </div>`
        }

                        
        // console.log("retruneing " + itemObj.ingredients)

        // Display ingredients nested
        const nestedIngredientsObj = getNestedIngredients(itemObj)
        const itemNestedIngredientsListEl = document.getElementById("item-nested-ingredients-list")

        let nestedListHtml = ''
        nestedListHtml = renderNestedIngredientsList(itemObj, nestedIngredientsObj)

        itemNestedIngredientsListEl.innerHTML = nestedListHtml

        // console.log("What we got ")
        // console.log(nestedIngredientsObj)

        //  I want to get all the base ingredients used
        const baseIngredientArr = getBaseIngredients(itemObj)
        const baseIngredientObj = getObjBaseIngredients(baseIngredientArr)


        // console.log ("All found ingredients ")
        // console.log (itemObj)
        // console.log(getAllIngredients(itemObj))

        // console.log(baseIngredientObj)
        let baseIngredientsHtml = ''

        baseIngredientsHtml = getBaseIngredientsListHtml(baseIngredientObj)

        const itemBaseIngredientsListEl = document.getElementById("item-base-ingredients-list")
        if (baseIngredientsHtml)
        {
            itemBaseIngredientsListEl.classList.remove("hidden")
        }
        else
        {
            itemBaseIngredientsListEl.classList.add("hidden")
        }
        itemBaseIngredientsListEl.innerHTML = baseIngredientsHtml

    }
    else
    {

    }

    itemDetailsEl.innerHTML = detailsHTML
}

function displaySelectedItem(itemName)
{
    const selectedItemEl = document.getElementById("item-selected-details")
    let displayHtml = ''

    if (itemName)
    {
        const itemObj = getIngredientObjByName(itemName)

        const itemMethod = itemObj?.method ?? ''
        const itemIngredients = itemObj?.ingredients ?? ''
        const itemDrop = itemObj?.drop ?? ''
        const itemPurchase = itemObj?.purchase ?? ''

        console.log(itemName)
        displayHtml = `<h3>${itemName}</h3>`
        

        if (itemMethod){
            displayHtml += `<p>Method: ${itemMethod} (${getCookingRankByMethod(itemMethod)})</p>`
        }
        if (itemIngredients){
            displayHtml += itemIngredients.map(function(ingredient){
                return `<li>${ingredient}</li>`
            }).join('')
        }
        if (itemObj?.purchase)
        {
            displayHtml += `
                            <div>
                            <p>Purchase from</p>
                            <p>${itemObj.purchase}</p>
                            </div>`
        }
        if (itemDrop){
            displayHtml += `<p>Drop location</p>`

            if(itemDrop?.fishing)
            {
                displayHtml += `<ul>Fishing`

                displayHtml += itemDrop.fishing.map(function(location)
                {
                    return `<li>${location}</li>`
                }).join('')
                displayHtml += `</ul>`
            }
        }

        if (!itemObj)
        {
            displayHtml += `Uh oh! This item appears to be missing from the database... pls tell Wyndia`
        }
    }

    selectedItemEl.innerHTML = displayHtml
}

function renderNestedIngredientsList(itemObj, nestedIngredientsObj)
{
    let listHtml = ''

    listHtml = `
                <h2>Ingredient Tree</h2>
                <ul class="nested-list-top">
                <li><span>${itemObj.method}</span>${itemObj.name}`
    listHtml += renderNestedIngredients(nestedIngredientsObj)
    listHtml += `</li>`
    listHtml += `</ul>`

    return listHtml
}

function renderNestedIngredients(obj, index = 0){
    let nestedHtml = ''

    nestedHtml = `<ul class='nested-ingredient index-${index}'>`

    for (const ingredient in obj){
        nestedHtml += `<li class="index-${index}"><span>${getMethod(ingredient) ?? ''}</span><div data-name="${ingredient}">${ingredient}</div>`

        const nested = obj[ingredient]

        if (nested && Object.keys(nested).length > 0){
            // Recursively render nested ingredients
            nestedHtml += renderNestedIngredients(nested, index+1)
        }

        nestedHtml += `</li>`
    }

    nestedHtml += "</ul>"

    return nestedHtml
}

function getNestedIngredients(itemObj)
{
    return parseNestedIngredients(itemObj)
}

function getMethod(itemName)
{
    const itemObj = ingredientsData.find(function(item)
    {
        return item.name === itemName
    })

    if (itemObj)
    {
        return itemObj.method
    }
    else{
        return ''
    }    
}

function parseNestedIngredients(ingredientObj)
{
    let recipeObj = {}

    // if no ingredients found
    if(!ingredientObj || !Array.isArray(ingredientObj.ingredients))
    {
        return recipeObj
    }

    for (const ingredient of ingredientObj.ingredients)
    {
        const itemObj = ingredientsData.find(function(item){
            return item.name === ingredient
        })
        // console.log(ingredient)
        // Checks if the object from ingredientsData exists and checks if it also has ingredients property
        if (itemObj && 'ingredients' in itemObj)
        {
            // console.log(ingredient + " exists in data")

            // Recursive Call to get nested ingredients
            const nestedIngredients = parseNestedIngredients(itemObj)
            // console.log("From parseNestedIngredients()")
            // console.log(nestedIngredients)
            
            recipeObj[ingredient] = nestedIngredients
            // console.log("recipe obj is now the following ")
            // console.log(recipeObj)
        }
        else    // if its a base ingredient
        {
            // console.log("Base Ingredient Found " + ingredient)
            // I guess if its a base ingredient just slap it into the object
            recipeObj[ingredient] = {}
            // console.log("recipe obj is now the following ")
            // console.log(recipeObj)
        }
    }

    return recipeObj
}
function getBaseIngredientsListHtml(listObj)
{
    let listHtml = ''

    listHtml += `<h2>Base Ingredients</h2>`

    for (const name in listObj){
        const quantity = listObj[name]
        listHtml += `<li data-name="${name}">${quantity}x ${name}</li>`
    }

    return listHtml
}

// Sorts an array into a array of objects with name and quantity
function getObjBaseIngredients(arr){

    let baseIngredients = {};

    arr.forEach(function(ingredient){
        // add ingredient count by 1 or set to 1 if doesn't exist
        baseIngredients[ingredient] = (baseIngredients[ingredient] || 0) + 1
    })

    return baseIngredients
}

function getBaseIngredients(ingredientObj)
{
    const baseIngredientsArr = parseBaseIngredients(ingredientObj)
    return baseIngredientsArr
}

function parseAllIngredients(ingredientObj)
{
    const ingredientsArr = []

        // skip if no ingredients array
    if(!ingredientObj || !Array.isArray(ingredientObj.ingredients))
    {
        return ingredientsArr
    }

        // for each item in the object's ingredients property
    for (const ingredient of ingredientObj.ingredients)
    {
        
        const itemObj = ingredientsData.find(function(item){
            return item.name === ingredient
        })

        ingredientsArr.push(ingredient);

        //  if the ingredient also has base ingredients
        if (itemObj && 'ingredients' in itemObj)
        {
            const nestedIngredients = parseAllIngredients(itemObj)
            ingredientsArr.push(...nestedIngredients)
        }
        else    // if its a base ingredient
        {
            // console.log("Base Ingredient Found " + ingredient)
            // ingredientsArr.push(ingredient)
        }
    }

    return ingredientsArr
}

function getAllIngredients(ingredientObj)
{
    const allIngredientsArr = parseAllIngredients(ingredientObj)
    return allIngredientsArr
}

function parseBaseIngredients(ingredientObj)
{
    const ingredientsArr = []

    // skip if no ingredients array
    if(!ingredientObj || !Array.isArray(ingredientObj.ingredients))
    {
        return ingredientsArr
    }

    for (const ingredient of ingredientObj.ingredients)
    {
        // console.log(ingredient)
        const itemObj = ingredientsData.find(function(item){
            return item.name === ingredient
        })

        // Checks if the object from ingredientsData exists and checks if it also has ingredients property
        if (itemObj && 'ingredients' in itemObj)
        {
            //  console.log(ingredient + " exists in data")

             // Recursive Call to get nested ingredients
             const nestedIngredients = parseBaseIngredients(itemObj)
             ingredientsArr.push(...nestedIngredients)
        }
        else    // if its a base ingredient
        {
            // console.log("Base Ingredient Found " + ingredient)
            ingredientsArr.push(ingredient)
        }
    }
    return ingredientsArr
}

function parseIngredients(ingredientsArr)
{
    let results = []

    for (const ingredient of ingredientsArr){
        const itemObj = ingredientsData.find(function(item){
            return item.name === ingredient
        })

        // Checks if the object from ingredientsData exists and checks if it also has ingredients
        if (itemObj && 'ingredients' in itemObj)
        {
            console.log(ingredient + " exists in data")

            //  Recursive call to get nested ingredients
            const nestedResults = parseIngredients(itemObj.ingredients)
            results.push(...nestedResults)
        }
        else
        {
            console.log("Base Ingredient Found " + ingredient)
            results.push(ingredient)
        }

        return results
    }

    // ingredientsArr.forEach(function(ingredient){
    //     console.log(ingredient)
        
    //     const itemObj = ingredientsData.find(function(item){
    //         return item.name === ingredient
    //     })

    //     // Checks if the object from ingredientsData exists and checks if it also has ingredients
    //     if (itemObj && 'ingredients' in itemObj)
    //     {
    //         console.log(ingredient + " exists indata")
    //         // Gonna try this parsing through those ingredients too
    //         testItem = parseIngredients(getIngredientObjByName(ingredient).ingredients)
    //     }
    //     else
    //     {
    //         console.log(`base ingredients found ${ingredient}`)
    //         return ingredient
    //     }
    // })
    // console.log(testItem)
    // return testItem
}

function getIngredientObjByName(itemName)
{        
    return ingredientsData.find(function(item)
    {
        if (item.name === itemName)
        {
            return item
        }
        
    })
}

function updateSearch()
{
    // const list = updateItemList(this.value)
    const list = updateItemList(itemSearchEl.value)

    const searchByName = document.getElementById("by-name").checked
    const searchByIngredient = document.getElementById("by-ingredient").checked

    if (!searchByName && !searchByIngredient)
    {
        const alertMessageStr = "You should probably check a search option..."

        itemListEl.innerHTML = `<p>${alertMessageStr}</p>`
        return
    }

    if(list)
    {
        const listHTML = list.map(function(item){

            // Warning - item names that contain double quotes will break. Rewrite with escaping/DOM functions if needed
            
            return `<li class="search-list">
            <div class="search-method" data-name="${item.name}">${item.method ?? ''}</div> 
            <div class="search-name" data-name="${item.name}">${item.name}</div>
            </li>`
        }).join('')

        itemListEl.innerHTML = listHTML

        if (!listHTML)
        {
            itemListEl.innerHTML = '<p> No Results... </p>'
        }
    }
    else
    {
        itemListEl.innerHTML = '<p>Search field empty</p>'
    }
}

function renderCookingDish()
{
    const item = "Black Tea Honey Scone"

    let tempItem = ingredientsData.find(function(i){
        return i.name === item;
    })

    console.log(tempItem)
    mainEl.innerHTML = `<p>Item: ${tempItem.name}</p>
                        <p>Ingredients: ${tempItem.ingredients}</p>`
}

function updateItemList(item)
{
    // if its not blank
    if (item)
    {
        const searchByName = document.getElementById("by-name").checked
        const searchByIngredient = document.getElementById("by-ingredient").checked

        // console.log("Search By Name: ", searchByName)
        // console.log("Search By Ingredient: ", searchByIngredient)
        
        const list = ingredientsData.filter(function(obj){
            // should check if we want to search by name
            const foundByName = searchByName ? obj.name.toLowerCase().includes(item.toLowerCase()) : false
            const foundByIngredient = searchByIngredient ? getAllIngredients(obj).some(function(ingredient)
                {
                    return ingredient.toLowerCase().startsWith(item.toLowerCase())
                }) : false

            // if (searchByName)
            // {
            //     return (obj.name.toLowerCase().includes(item.toLowerCase()))
            // }
            // else if (searchByIngredient)
            // {
            //     const ingredientsArr = getAllIngredients(obj)

            //     return ingredientsArr.some(function(ingredient)
            //     {
            //         return ingredient.toLowerCase().includes(item.toLowerCase())
            //     })
            // }
            
            return foundByName || foundByIngredient
        })
        return list
    }
    else
    {
        return false;
    }    
}

function checkBaseIngredient(obj, ingredient)
{
    console.log(obj)
}


function setCookingBarPercentages(percenta, percentb = 0, percentc = 0)
{
    const percentAEl = document.getElementById("mockup-pct1")
    const percentBEl = document.getElementById("mockup-pct2")
    const percentCEl = document.getElementById("mockup-pct3")

    percentAEl.style.width = `${percenta}%`
    percentBEl.style.width = `${percentb}%`
    percentCEl.style.width = `${percentc}%`
}

function getMethodbyCookingRank(cookingRank)
{
    switch (cookingRank){
        case "Rank Novice":
            return "Mix";
        case "Rank F":
            return "Bake";
        case "Rank E":
            return "Simmer";
        case "Rank D":
            return "Knead";
        case "Rank C":
            return "Boil";
        case "Rank B":
            return "Noodle";
        case "Rank A":
            return "Deep-fry";
        case "Rank 9":
            return "Stir-fry";
        case "Rank 8":
            return "Pasta Making";
        case "Rank 7":
            return "Jam Making";
        case "Rank 6":
            return "Pie Making";
        case "Rank 5":
            return "Steaming";
        case "Rank 4":
            return "Pizza Making";
        case "Rank 3":
            return "Fermenting";
        case "Rank 2":
            return "Sous Vide";
        case "Rank 1":
            return "Julienning";
        default:
            return "Unknown";
    }
}

function getCookingRankByMethod(methodName)
{
    switch (methodName){
        case "Mix":
            return "Rank Novice";
        case "Bake":
            return "Rank F";
        case "Simmer":
            return "Rank E";
        case "Knead":
            return "Rank D";
        case "Boil":
            return "Rank C";
        case "Noodle Making":
            return "Rank B";
        case "Deep-fry":
            return "Rank A";
        case "Stir-fry":
            return "Rank 9";
        case "Pasta Making":
            return "Rank 8";
        case "Jam Making":
            return "Rank 7";
        case "Pie Making":
            return "Rank 6";
        case "Steaming":
            return "Rank 5";
        case "Pizza Making":
            return "Rank 4";
        case "Fermenting":
            return "Rank 3";
        case "Sous Vide":
            return "Rank 2";
        case "Julienning":
            return "Rank 1";
        default:
            return "Unknown";
    }
}

// Returns the minimum rank required to cook all ingredients
function getRequiredCookingRankAll(itemObj)
{
    if (!itemObj) return "Rank Novice";

    //So I get the method name
    const currentRank = getCookingRankByMethod(itemObj.method)
    console.log(`this item ${itemObj.name} requires ${currentRank}`)

    //Maybe add an ignore statement for objects that are purchaseable
    if (itemObj?.purchase)
    {
        console.log(`skipping ${itemObj.name} due to being purchaseable`)
        return "Rank Novice"
    }

    let highestNestedRank = "Rank Novice"

    //  If there are ingredients
    if (Array.isArray(itemObj.ingredients))
    {
        for (const ingredient of itemObj.ingredients){
            const ingredientObj = ingredientsData.find(function(item){
                return item.name === ingredient
            })

            const nestedRank = getRequiredCookingRankAll(ingredientObj)

            highestNestedRank = compareRankHighest(highestNestedRank, nestedRank)
        }
    }

    return compareRankHighest(currentRank, highestNestedRank)
}

function getRankingByCookingRankName(rankName){
    
    const rankOrder = {
        "Unlearned": 0,
        "Rank Novice": 1,
        "Rank F": 2,
        "Rank E": 3,
        "Rank D": 4,
        "Rank C": 5,
        "Rank B": 6,
        "Rank A": 7,
        "Rank 9": 8,
        "Rank 8": 9,
        "Rank 7": 10,
        "Rank 6": 11,
        "Rank 5": 12,
        "Rank 4": 13,
        "Rank 3": 14,
        "Rank 2": 15,
        "Rank 1": 16,
        "Dan 1": 17,
        "Dan 2": 18,
        "Dan 3": 19,
    }

    const value = rankOrder[rankName] || 0

    return value
}

function compareRankHighest(rank1, rank2)
{
    const value1 = getRankingByCookingRankName(rank1)
    const value2 = getRankingByCookingRankName(rank2)

    if (value1 >= value2)
    {
        return rank1
    }
    if (value2 > value1)
    {
        return rank2
    }
    return "uh oh"
}

function isIngredientRankHigherThanMainDish(mainRank, ingredientRank)
{
    const mainValue = getRankingByCookingRankName(mainRank)
    const ingredientValue = getRankingByCookingRankName(ingredientRank)

    return ingredientValue > mainValue
}

updateSearch()