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

const AppState = {
    selectedItemName: "",
    selectedRecipeIndex: 1,

    setRecipeNum(index){
        this.selectedRecipeIndex = index
    },

    setSelectedItemName(name){
        this.selectedItemName = name
    },

    getRecipeNum(){
        return this.selectedRecipeIndex
    },

    getSelectedItemName(){
        return this.selectedItemName
    },
}

//  Listener for user clicks
document.addEventListener('click', function(e){

    //  If the user clicked on an item in the searchlist
    if (e.target.classList.contains('search-name') && e.target.dataset.name)
    {
        //  Set the selected item name and recipe number
        AppState.setRecipeNum(1)
        AppState.setSelectedItemName(e.target.dataset.name)

        handleSearchListClick()
    }
    //  If the user clicked on a recipe number button
    else if (e.target.classList.contains("recipe-span")){
        const num = parseInt(e.target.dataset.num)
        AppState.setRecipeNum(num)

        handleRecipeNumberClick()
    }
    //  If the user clicked on a sub ingredient
    else if (e.target.dataset.name)
    {
        //  Show Sub Ingredient section
        displaySelectedItem(e.target.dataset.name)

        handleSubItemClick()
    }

    console.log(e.target)
})


//  Updates search list
function updateSearch()
{
    const list = updateSearchList(itemSearchEl.value)

    const searchByName = document.getElementById("by-name").checked
    const searchByIngredient = document.getElementById("by-ingredient").checked

    //  If no search options have been selected
    if (!searchByName && !searchByIngredient)
    {
        const alertMessageStr = "You should probably check a search option..."

        itemListEl.innerHTML = `<p>${alertMessageStr}</p>`
        return
    }

    if (list)
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
            itemListEl.innerHTML = '<p>No Results...</p>'
        }
    }
    else
    {
        itemListEl.innerHTML = '<p>Search field empty</p>'
    }
}

function updateSearchList(item)
{
    //  If Item Search is not blank
    if (item)
    {
        const searchByName = document.getElementById("by-name").checked
        const searchByIngredient = document.getElementById("by-ingredient").checked
        
        //  Find Items based on search conditions
        const list = ingredientsData.filter(function(obj)
        {
            const foundByName = searchByName ? obj.name.toLowerCase().includes(item.toLowerCase()) : false
            const foundByIngredient = searchByIngredient ? getAllIngredients(obj).some(function(ingredient)
                {
                    return ingredient.toLowerCase().startsWith(item.toLowerCase())
                }) : false
            return foundByName || foundByIngredient
        })
        return list
    }
    else
    {
        return false;
    }    
}


//  Render page
function render()
{
    itemDetailsEl.innerHTML = getDetailsHTML()
}

//  Get site html
function getDetailsHTML()
{
    let detailsHTML = ''
    const itemName = AppState.getSelectedItemName()

    //  If a main item exists
    if (itemName)
    {
        const itemObj = ingredientsData.find(function(item)
        {
            return item.name === itemName
        })  

        //  Main Item Name HTML
        detailsHTML = ` <h2>${itemObj.name}</h2>`

        //  Display Main Item's Method
        const itemMethod = itemObj?.method ?? ''

        if (itemMethod)
        {
            detailsHTML += `<p>${itemMethod} (${getCookingRankByMethod(itemMethod)} Cooking)</p>`
        }

        const rankNameForAll = getRequiredCookingRankAll(itemObj)

        //  Don't show warning message on items that can't be cooked
        if (isIngredientRankHigherThanMainDish(0, getCookingRankByMethod(itemMethod)))
        {
            if (isIngredientRankHigherThanMainDish(getCookingRankByMethod(itemMethod), getRequiredCookingRankAll(itemObj)))
            {
                detailsHTML +=`<p>*${rankNameForAll} Cooking is required for ${getMethodbyCookingRank(rankNameForAll)}</p>`
            }
        }

        //  If recipe parameter exists
        if (itemObj?.recipe)
        {
            //  Also check if other recipes exist
            if (itemObj?.recipe2 || itemObj?.recipe3 || itemObj?.recipe4 || itemObj?.recipeInGame)
            {
                //  Display buttons for other known recipes
                detailsHTML += `<p>This item has multiple known recipes</p>`
                detailsHTML += `<p>
                    ${itemObj?.recipeInGame ? `<span class="recipe-span ${AppState.getRecipeNum() == 0 ? "selected" : ""}" data-num="0">In-game</span>` : ""}
                    ${itemObj?.recipe ? `<span class="recipe-span ${AppState.getRecipeNum() == 1 ? "selected" : ""}" data-num="1">1</span>` : ""}
                    ${itemObj?.recipe2 ? `<span class="recipe-span ${AppState.getRecipeNum() == 2 ? "selected" : ""}" data-num="2">2</span>` : ""}
                    ${itemObj?.recipe3 ? `<span class="recipe-span ${AppState.getRecipeNum() == 3 ? "selected" : ""}" data-num="3">3</span>` : ""}
                    ${itemObj?.recipe4 ? `<span class="recipe-span ${AppState.getRecipeNum() == 4 ? "selected" : ""}" data-num="4">4</span>` : ""}
                    </p>`
            }

            let recipeHtml = ''

            if (AppState.getRecipeNum() == 1){
                recipeHtml = itemObj.recipe.map(function(item){
                    return `<li>${item.name} (${item.percent}%)</li>`
                }).join('')
            }
            else if (AppState.getRecipeNum() == 2){
                recipeHtml = itemObj.recipe2.map(function(item){
                    return `<li>${item.name} (${item.percent}%)</li>`
                }).join('')
            }
            else if (AppState.getRecipeNum() == 3){
                recipeHtml = itemObj.recipe3.map(function(item){
                    return `<li>${item.name} (${item.percent}%)</li>`
                }).join('')
            }
            else if (AppState.getRecipeNum() == 4){
                recipeHtml = itemObj.recipe4.map(function(item){
                    return `<li>${item.name} (${item.percent}%)</li>`
                }).join('')
            }
            else if (AppState.getRecipeNum() == 0){
                recipeHtml = itemObj.recipeInGame.map(function(item){
                    return `<li>${item.name} (${item.percent}%)</li>`
                }).join('')
            }

            detailsHTML +=  `
                <div>
                    <p>Main Ingredients</p>
                    <ul>${recipeHtml}</ul>
                </div>`

            let percentArr = ""
            
            if (AppState.getRecipeNum() == 1){
                percentArr = itemObj.recipe.map(function(item){
                    return item.percent
                })
            }
            else if (AppState.getRecipeNum() == 2){
                percentArr = itemObj.recipe2.map(function(item){
                    return item.percent
                })
            }
            else if (AppState.getRecipeNum() == 3){
                percentArr = itemObj.recipe3.map(function(item){
                    return item.percent
                })
            }
            else if (AppState.getRecipeNum() == 4){
                percentArr = itemObj.recipe4.map(function(item){
                    return item.percent
                })
            }
            else if (AppState.getRecipeNum() == 0){
                percentArr = itemObj.recipeInGame.map(function(item){
                    return item.percent
                })
            }

            //  Add the main item to the recipe bars
            setCookingBarPercentages(percentArr[0], percentArr[1], percentArr[2])
            setCookingBarName(itemObj.name)
            setCookingBarIngredientsList(itemObj)
        }
        //  fallback to old ingredients code
        else if (itemObj?.ingredients)
        {
            detailsHTML +=  `
                            <div>
                            <p>Main Ingredients</p>
                            <p>${itemObj.ingredients}</p>
                            </div>`

            // setCookingBarPercentages(0)
            // setCookingBarName("Unknown Item")
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
            const itemCurrency = itemObj?.priceCurrency ? ` ${itemObj?.priceCurrency}` : "g"
            console.log(itemCurrency)

            detailsHTML += `
                            <div>
                            <p>Price</p>
                            <p>${itemObj.price}${itemCurrency}</p>
                            </div>`
        }

        //  Display Nested Ingredients
        const nestedIngredientsObj = getNestedIngredients(itemObj)
        const itemNestedIngredientsListEl = document.getElementById("item-nested-ingredients-list")

        let nestedListHtml = ''
        nestedListHtml = renderNestedIngredientsList(itemObj, nestedIngredientsObj)

        itemNestedIngredientsListEl.innerHTML = nestedListHtml


        //  Display Base Ingredients
        const baseIngredientArr = getBaseIngredients(itemObj)
        const baseIngredientObj = getObjBaseIngredients(baseIngredientArr)

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

    return detailsHTML
}

function handleSearchListClick()
{
    document.getElementById("sub-item-details").classList.add("hidden")
    document.getElementById("cooking-window-mockup").classList.remove("hidden")

    render()
}

function handleRecipeNumberClick()
{
    render()
}

function handleSubItemClick()
{
    document.getElementById("sub-item-details").classList.remove("hidden")
}

function displaySelectedItem(itemName)
{
    const selectedItemEl = document.getElementById("sub-item-details")
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

            if (itemObj?.price)
            {
                const itemCurrency = itemObj?.priceCurrency ? ` ${itemObj?.priceCurrency}` : "g"

                displayHtml += `<div>
                            <p>Price</p>
                            <p>${itemObj.price}${itemCurrency}</p>
                            </div>`
            }
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
            if(itemDrop?.gathering)
            {
                displayHtml += `<ul>Gathering`

                displayHtml += itemDrop.gathering.map(function(method)
                {
                    return `<li>${method}</li>`
                }).join('')
                displayHtml += `</ul>`
            }
        }

        if (!itemObj)
        {
            displayHtml += `Uh oh! This item appears to be missing from the database... pls tell Wyndia`

            //  setCookingBarName("Unknown Item")
            //  setCookingBarPercentages(0)
        }
        else
        {
            
            
            let percentArr = ""

            //  And set cooking bar percentages if available
            if (AppState.getRecipeNum() == 1){
                percentArr = itemObj.recipe?.map(function(item){
                    return item.percent;
                }) || [];
            }
            else if (AppState.getRecipeNum() == 2){
                percentArr = itemObj.recipe2?.map(function(item){
                    return item.percent;
                }) || itemObj.recipe?.map(function(item){
                    return item.percent;
                }) || [];
            }
            else if (AppState.getRecipeNum() == 3){
                percentArr = itemObj.recipe3?.map(function(item){
                    return item.percent;
                }) || itemObj.recipe?.map(function(item){
                    return item.percent;
                }) || [];
            }
            else if (AppState.getRecipeNum() == 4){
                percentArr = itemObj.recipe4?.map(function(item){
                    return item.percent;
                }) || itemObj.recipe?.map(function(item){
                    return item.percent;
                }) || [];
            }
            else if (AppState.getRecipeNum() == 0){
                percentArr = itemObj.recipeInGame?.map(function(item){
                    return item.percent;
                }) || itemObj.recipe?.map(function(item){
                    return item.percent;
                }) || [];
            }

            //  Set name if recipe% exists
            if (percentArr != "")
            {
                setCookingBarName(itemName)
            
                setCookingBarPercentages(percentArr[0], percentArr[1], percentArr[2])
                setCookingBarIngredientsList(itemObj)
            }
        }
    }
    selectedItemEl.innerHTML = displayHtml
}



// Nested Ingredient Functions



function renderNestedIngredientsList(itemObj, nestedIngredientsObj)
{
    let listHtml = ''

    listHtml = `
                <h2>Ingredient Tree</h2>
                <ul class="nested-list-top">
                <li class="index-main"><span>${itemObj.method}</span><div data-name="${itemObj.name}">${itemObj.name}</div>`
    listHtml += renderNestedIngredients(nestedIngredientsObj)
    listHtml += `</li>`
    listHtml += `</ul>`

    return listHtml
}

function renderNestedIngredients(obj, index = 0){
    let nestedListHtml = ''

    nestedListHtml = `<ul class='nested-ingredient index-${index}'>`

    for (const ingredient in obj){
        nestedListHtml += `<li class="index-${index}"><span>${getMethod(ingredient) ?? ''}</span><div data-name="${ingredient}">${ingredient}</div>`

        const nested = obj[ingredient]

        if (nested && Object.keys(nested).length > 0){
            //  Recursively render nested ingredients
            nestedListHtml += renderNestedIngredients(nested, index+1)
        }

        nestedListHtml += `</li>`
    }

    nestedListHtml += "</ul>"

    return nestedListHtml
}

function getNestedIngredients(itemObj)
{
    return parseNestedIngredients(itemObj)
}

function parseNestedIngredients(ingredientObj)
{
    let recipeObj = {}

    //  If no ingredients found
    if(!ingredientObj || !Array.isArray(ingredientObj.ingredients))
    {
        return recipeObj
    }

    // switch (AppState.getRecipeNum()) {
    //     case "1":
    //         objRecipe = ingredientObj.recipe
    //         break;
    //     case "2":
    //         objRecipe = ingredientObj.recipe2
    //         break;
    //     case "3":
    //         objRecipe = ingredientObj.recipe3
    //         break;
    //     case "4":
    //         objRecipe = ingredientObj.recipe4
    //         break;
    //     case "0":
    //         objRecipe = ingredientObj.recipeInGame
    //         break;
    //     default:
    //         console.log("Error, unknown recipe for parseNestedIngredients")
    //         break;
    // }

    // let recipeIngredients = ""
    
    // switch( parseInt( AppState.getRecipeNum() ) ){
    //     case 1:
    //         if (recipeIngredients?.recipe !== undefined){
    //             recipeIngredients = ingredientObj.recipe.map(ingredient => ingredient.name)
    //         }
    //         else{    //Fallback if recipe property doesn't exist
    //             recipeIngredients = ingredientObj.ingredients
    //         }
    //     break;
    //     case 2:
    //         if (recipeIngredients?.recipe2)
    //             recipeIngredients = ingredientObj?.recipe2.map(ingredient => ingredient.name)
    //         else
    //             recipeIngredients = ingredientObj.ingredients
    //     break;
    //     case 3:
    //         if (recipeIngredients?.recipe3)
    //             recipeIngredients = ingredientObj.recipe3.map(ingredient => ingredient.name)
    //         else
    //             recipeIngredients = ingredientObj.ingredients
    //     break;
    //     case 4:
    //         if (recipeIngredients?.recipe4)
    //             recipeIngredients = ingredientObj.recipe4.map(ingredient => ingredient.name)
    //         else
    //             recipeIngredients = ingredientObj.ingredients
    //     break;
    //     case 0:
    //         if (recipeIngredients?.recipeInGame)
    //             recipeIngredients = ingredientObj.recipe0.map(ingredient => ingredient.name)
    //         else
    //             recipeIngredients = ingredientObj.ingredients
    //     break;
    //     default:
    //     console.log('Recipe Not Found')
    //     break;
    // }

    // console.log(recipeIngredients)
    // console.log(ingredientObj.ingredients)

    for (const ingredient of ingredientObj.ingredients)
    {
        const itemObj = ingredientsData.find(function(item){
            return item.name === ingredient
        })

        // Checks if the object from ingredientsData exists and checks if it also has ingredients property
        if (itemObj && 'ingredients' in itemObj)
        {
            // Recursive call to get Nested Ingredients
            const nestedIngredients = parseNestedIngredients(itemObj)
            
            recipeObj[ingredient] = nestedIngredients
        }
        else    // If its a base ingredient
        {
            // I guess if its a base ingredient just slap it into the object
            recipeObj[ingredient] = {}
        }
    }

    return recipeObj
}



// Base Ingredient Functions



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

//  Sorts an array into a array of objects with name and quantity
function getObjBaseIngredients(arr){

    let baseIngredients = {};

    arr.forEach(function(ingredient){
        //  add ingredient count by 1 or set to 1 if doesn't exist
        baseIngredients[ingredient] = (baseIngredients[ingredient] || 0) + 1
    })

    return baseIngredients
}

function getBaseIngredients(ingredientObj)
{
    const baseIngredientsArr = parseBaseIngredients(ingredientObj)
    return baseIngredientsArr
}

function parseBaseIngredients(ingredientObj)
{
    const ingredientsArr = []

    //  skip if no ingredients array
    if(!ingredientObj || !Array.isArray(ingredientObj.ingredients))
    {
        return ingredientsArr
    }

    for (const ingredient of ingredientObj.ingredients)
    {
        const itemObj = ingredientsData.find(function(item){
            return item.name === ingredient
        })

        // Checks if the object from ingredientsData exists and checks if it also has ingredients property
        if (itemObj && 'ingredients' in itemObj)
        {
             // Recursive Call to get nested ingredients
             const nestedIngredients = parseBaseIngredients(itemObj)
             ingredientsArr.push(...nestedIngredients)
        }
        else    // if its a base ingredient
        {
            ingredientsArr.push(ingredient)
        }
    }
    return ingredientsArr
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


function parseIngredients(ingredientsArr)
{
    let results = []

    for (const ingredient of ingredientsArr){
        const itemObj = ingredientsData.find(function(item){
            return item.name === ingredient
        })

        //  Checks if the object from ingredientsData exists and checks if it also has ingredients
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

function checkBaseIngredient(obj, ingredient)
{
    console.log(obj)
}

function setCookingBarName(itemName)
{
    const mockupRecipeNameEl = document.getElementById("mockup-recipe-name")
    mockupRecipeNameEl.textContent = itemName
}

function setCookingBarPercentages(percenta = 0, percentb = 0, percentc = 0)
{
    const percentAEl = document.getElementById("mockup-pct1")
    const percentBEl = document.getElementById("mockup-pct2")
    const percentCEl = document.getElementById("mockup-pct3")

    percentAEl.style.width = `${percenta}%`
    percentBEl.style.width = `${percentb}%`
    percentCEl.style.width = `${percentc}%`
}

function setCookingBarIngredientsList(itemObj){
    const ingredientListEl = document.getElementById("mockup-ingredients-instructions")

    let listHtml = ""
    
    // itemObj.recipe?.map(function(item){
    //                 return `<li>${item.name} (${item.percent}%)</li>`
    //             }).join('') || []

    //  This code is a little unstable 

    if (AppState.getRecipeNum() == 1){
        listHtml = itemObj.recipe.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('')
    }
    else if (AppState.getRecipeNum() == 2){
        listHtml = itemObj.recipe2?.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('') || itemObj.recipe.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('')
    }
    else if (AppState.getRecipeNum() == 3){
        listHtml = itemObj.recipe3?.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('') || itemObj.recipe.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('')
    }
    else if (AppState.getRecipeNum() == 4){
        listHtml = itemObj.recipe4?.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('') || itemObj.recipe.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('')
    }
    else if (AppState.getRecipeNum() == 0){
        listHtml = itemObj.recipeInGame?.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('') || itemObj.recipe.map(function(item){
            return `<li>${item.name} (${item.percent}%)</li>`
        }).join('')
    }

    ingredientListEl.innerHTML = listHtml
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

//  Gets cooking method of cooking dish by name
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

    const currentRank = getCookingRankByMethod(itemObj.method)

    //  Maybe add an ignore statement for objects that are purchaseable
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