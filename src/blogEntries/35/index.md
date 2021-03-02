---
title: GoldiDev and the 3 Test patterns
publishedAt: Mon Mar 01 2021 11:05:33 GMT-0800 (Pacific Standard Time)
---

I recently did a code challenge for a job and came up with a nice way to test application logic.

<style>
body {font-family: Arial;}

/* Style the tab */
.tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}

/* Style the buttons inside the tab */
.tab button {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
  font-size: 17px;
}

/* Change background color of buttons on hover */
.tab button:hover {
  background-color: #ddd;
}

/* Create an active/current tablink class */
.tab button.active {
  background-color: #ccc;
}

/* Style the tab content */
.tabcontent {
  display: none;
  /* padding: 6px 12px;
  border: 1px solid #ccc;
  border-top: none; */
}
</style>



## Tests and types of tests

Developers like to have the same arguments over and over again. One perennial favorite is the naming-of-types-of tests debate- as in, what _kind_ of test is this? You have unit tests, the smallest of all types of tests, which typically interogate functions. This is not to be confused with _functional testing_ which is NOT the testing of functions, nor the testing _by_ functions, but the testing of _functionality_. There are "Acceptance tests" and "Integration tests", commonly understood to be bigger tests of whole systems. In the context of of web development, this means running a server(s), a browser, a bot and Selenium. You can test functions or classes (which are of course just functions). You can test the React classes in multiple ways too. There's a LOT of ways you can test your application and knowing which are worthwhile, and which are not, can make or break your deadlines.

Each type of test has a value and a cost. The test takes developer-time to write and maintain. Long running tests make you wait around, like a gambler at a slot machine, hoping that _maybe_ this time, your tests will pass 100%. Some tests are snakepits of complication, while others are too simple to be of any use. There really isn't a right or wrong answer- intuition and experience can teach which tests to apply and where. 

My experience has taught me a few things about web app architecture: The view ought to be a simple functional React render, a redux store should manage nearly all the application state, selectors should channel that store into your React view, and **testing should be done by applying actions to the store and interogating the selectors.** This philosophy drove my design of Burger Lord. 

## Integration tests, or "This porridge is too hot"

Typically, web developers employ cucumber to write (nearly) plain English (or whatever your language may be) scenarios describing a user's interactions with a webpage. The cucumber scenarios will be parsed and matched against regular expressions, then sent to a selenium process driving a browser, the browser making requests against the server. It's a slow roundtrip, waiting for pages to load. While there's a lot of worth in writing the scenarios themselves, the actual process of writing and running full integration tests is enormous. Integeration tests are fussy to write and are generally just kind of flimsy- your QA person will probably know of a few tests that just fail for some mysterious reason from time to time. These "big" tests are valuable for big features but the investment in developer-time is not to be ignored. Integration test suite run-times are often measured in hours. Thse big tests are so _expensive_, they really ought to be measured in dollars because AWS resources aren't free. Niether are QA-hours and dev-hours spent watching progress bars. And trust me when I say that if a test is not fast and nimble enough for a developer to find useful, they will not WANT to write, maintain or run it!

## Unit tests, or "This porridge is too cold"

On the far end of the spectrum ot test-types, we have unit tests. These tests are typically assertions of functions- that, for _this_ input, a function returns an expected _output_. "Small" tests are usefull, but also limited. Programmers know to write functions which are small and understandable, and when testing their own work, will simply cheese-it with easy tests in an effort to keep the code-coverage high enough to pass PR review. So often, the functions themseleves are correct- it's the interaction between functions which fail. The tests are easier to write, and much faster to execute, but much less usefull, because testing the obvious is, by definition, not really necesssary. 

## React tests, or "This porridge is burnt on the top and frozen on the bottom!"

You can also test React components. You typically mount or render or virtually render a react element, (it's complicated) pass it a mocked props and then make assertions. This sounds appealing but the reality is having multiple ways of testing a React component isn't fun, it's confusing. _React components are things that really ought not need to be tested at all_, and none of the options at your disposal are intuitive. React components have the capacity for state and complex behavior, but anyone who's had to deal with such knows it's far better to write simple views. You really REALLY do NOT want big fat React views- you want small functions that take props and event hooks, and return HTML. And if your React classes ARE a straightforward mapping of props to html, do you really need to test it? Any visual artifacts are quite easy to detect by eye- you are probably prototyping in storybooks anyways. Add to the situation the state of React testing, which is fragmented and confusing. It's an absolute time-sink for little value returned.

## Data mocking, or "This porridge isn't even cooked!?"

The art and science of state-management is relatively new to me. I never really appreciated data flow, until I really learned to love redux. But discrete actions changing an store with functions is the RIGHT approach to software. I can think of few applications, web development or otherwise, that would benefit from any other architecture. Back in the old days, we just had data flying around and when we tested our code, we did so by mocking and stubbing variables in our tests. It was a dark dark time- mocking your data properly is crucial to getting acurate test results, yet mocking data properly is near impossible to get right. It often leads to bugs-within-your-tests, a catch 22 where your tests perform more hacks than your 1st order code. It sounds heretical but it's true: Your tests need to be simpler than that which is being tested, but I've yet to use a data-faking tool that wasn't more trouble than it was worth. But with redux, this isn't a problem- just build your state though a series of actions. It's not a mock, or a stub, or any sort of fakery. It's the _actual_ store, built by the same series of actions the app would undergo "in the wild."

## Whats the worth of a test?
Tests are usefull for 2 reasons. 1) They provide struts for you to develop your features around today and 2) they identify regressions in the future. But not all features and regressions are made the same. Some are trivial- a date formatted incorrectly in an email is easy to identify, find and squash. Other bugs which are not so deterministic are much harder to solve. **If we so desired to measure bugs and features on a scale of difficulty, I'd imagine that the "hardness" would be measured by the number of redux actions required to reproduce it.**

Much like unit tests, react tests don't really help you solve difficult state-based bugs, because any bugs in your functional view will be trivial to solve. Obvious bugs tend to have obvious solutions. This is not always true, but is often true. Integration tests are state based, but are immensly expensive. We need a different kind of test- one that can test the core logic and the state of the app, as it changes, without (necessarily) involving the overhead of the view and without excessive testing apparati.

## "This porridge is juuuuust right!"

The web development community has pretty much concluded what I said earlier- your state should be a redux store, fed to a functional view. The bridge between the 2 is  "selector" provided by reselect. Selectors take the store's state, the minimal representation of your app, and apply some computed fields, then pass this "expanded", de-normalized data to the view. It's a natural chokepoint for data flowing through the application and it's also the natural place to test your application.

The implementation of the test is quite straightforward. We make the store, apply some actions, then take the new state, feed it to the selector, then finally make some assertions about the result of that selector. 

<div id="firstCodeSection">
<div class="tab">
    <button class="tablinks" onclick="openCity(event, 'test')">test.js</button>
    <button class="tablinks" onclick="openCity(event, 'store')">store.js</button>
    <button class="tablinks" onclick="openCity(event, 'selector')">selector.js</button>
  
</div>

<div id="test" class="tabcontent">
  <pre><code>  it('you compute the cost of a sandwich', () => {
    const store = storeCreator(initialState);
    const sandwichName = "The new name of a sandwich";

    assert.equal(NewOrderSelector(store.getState()).sandwiches.length, 0);
    store.dispatch({ type: "CHANGE_STAGED_SANDWICH_NAME", payload: sandwichName })
    store.dispatch({ type: "ADD_SANDWICH" })
    store.dispatch({ type: "SELECT_INGREDIENT_TO_PUSH", payload: { sandwichName: sandwichName, ingredientId: 5 } })
    store.dispatch({ type: "PUSH_INGREDIENT", payload: 0 })
    assert.equal(NewOrderSelector(store.getState()).sandwiches[0].cost, 5);
  });
</code></pre>
</div>

<div id="store" class="tabcontent active">
  <pre><code>export default (initialState) => createStore((state = [], action) => {
  switch (action.type) {

    case SELECT_INGREDIENT_TO_PUSH:
      return {
        ...state,
        sandwiches: state.sandwiches.map((sandwich) => {
          if (sandwich.name === action.payload.sandwichName) {
            sandwich.toPush = action.payload.ingredientId
          }
          return sandwich
        })
      }

    case PUSH_INGREDIENT:
      return {
        ...state,
        sandwiches: state.sandwiches.map((sandwich, ndx) => {
          if (ndx === action.payload) {
            sandwich.recipe.push(sandwich.toPush)
            sandwich.toPush = ""
          }
          return sandwich
        }),
      }
    case CHANGE_SANDWICH_NAME:
      return {
        ...state,
        sandwiches: state.sandwiches.map((s, ndx) => {
          if (ndx === action.payload.index) {
            s.name = action.payload.sandwichName
          }
          return s;
        })
      }

    case ADD_SANDWICH:
      return {
        ...state,
        stagedSandwich: "",
        sandwiches: [
          ...state.sandwiches,
          {
            name: state.stagedSandwich, recipe: [], toPush: ""
          }
        ]
      }

    case CHANGE_STAGED_SANDWICH_NAME:
      return {
        ...state,
        stagedSandwich: action.payload
      }

      return {
        ...state,
        orders: newOrders
      }

    default:
      return state
  }
}, initialState)
</code></pre>
</div>

<div id="selector" class="tabcontent">
  <pre><code>export const NewOrderSelector = createSelector([baseSelector], (base) => {

  const subTotal = base.sandwiches.reduce((mm, sandwich) => {
    return mm + sandwich.recipe.reduce((mm2, recipeIngredientId) => {
      return (mm2 + (base.ingredients.find((ingredient) => ingredient.id === recipeIngredientId).cost) )
    }, 0)
  }, 0)

  const grandTotal = (subTotal * (1 + (base.gratuity / 100))).toFixed(2);

  const runningTally = {};
  base.ingredients.forEach((ingredient) => runningTally[ingredient.id] = ingredient.amount)
  base.sandwiches.forEach((sandwich) => {
    sandwich.recipe.forEach((recipeIngredientId) => {
      runningTally[recipeIngredientId] = runningTally[recipeIngredientId] -1
    })
  })

  return {
    orders: base.orders,
    sandwiches: base.sandwiches.map((sandwich) => {
      return {
        ...sandwich,
        cost: sandwich.recipe.reduce((mm, id) => { return mm + base.ingredients.find((ingredient) => ingredient.id === id).cost }, 0)
      }
    }),
    ingredients: base.ingredients,

    gratuity: base.gratuity || 0,
    stagedSandwich: base.stagedSandwich,

    subTotal, grandTotal, runningTally,

    orderDisabled: base.sandwiches.length === 0 
  }
});
</code></pre>
</div>
</div>


We are getting a LOT of bang for our buck here. As long as we keep business logic out of the view, this test will hit all the important points, statefully, and without rendering any view. It's just a single node process unlike integration tests which must run full systems. There's no virtual events to trip over, and data setup is simple- no mocking or stubbing required. And this pattern can be used in node applications too- there's nothing about about redux and reselect preventing you from using them on the server-side too. These "selector-store tests" or maybe "redux-reselect" tests or whatever you want to call them, hit the sweet spot. They help enforce good architecture, they are _usefull_, rather than an obligation, they are fast as unit test and, can be, as expressive as integration tests. And if you _must_ do react-specific testing, that can be accomodated as well. _This testing strategy does not replace other kinds of tests as much as it complements them._

There's one more thing this testing strategy needs- our tests ought to be accesible to coders and non-coders alike.

We can make things even sweeter by introducing a dead-simple Cucumber DSL! If we map "Given" statements to the initial state of the store, the "When" statements to redux actions and the "Then" statements to aspects of the selector we wish to measure, we produce a modest Cucumber suite. We finally acheive the dream of a testing framework simpler than the thing being tested!


<div id="secondCodeSection">
<div class="tab">
  <button class="tablinks" onclick="openCity(event, 'scenarios')">scenarios.js</button>
  <button class="tablinks" onclick="openCity(event, 'givens')">givens.js</button>
  <button class="tablinks" onclick="openCity(event, 'whens')">whens.js</button>
  <button class="tablinks" onclick="openCity(event, 'thens')">thens.js</button>
</div>

<div id="scenarios" class="tabcontent">
  <pre><code>export default {
  "very simple scenarios": {
    "Test of sandwiches add": {
      givens: ["an initial store with ingredient #1 amount '100'"],
      whens: [
        "I change the staged sandwich name to 'Adams sandwich'",
        "I add the sandwich",
        "I change the staged sandwich name to 'Chaches sandwich'",
        "I add the sandwich",
      ],
      thens: [
        "sandwich #0 should have name 'Adams sandwich'",
        "sandwich #1 should have name 'Chaches sandwich'"
      ]
    }
  },
};
</code></pre>
</div>

<div id="givens" class="tabcontent">
  <pre><code>export default [
    { matcher: /an initial store with ingredient #(\d*) amount '(\d*)'/gm, modifier: (state) => state }
]
</code></pre>
</div>

<div id="whens" class="tabcontent">
<pre><code>
// Notice how there is 1 "when" for each redux action
export default [
  {
    matcher: /I submit the order with a grand total of '(.*)'/gm,
    action: NEW_ORDER,
    payload: (match) => match[0][1]
  },
  {
    matcher: /I remove sandwich #(.*)/gm,
    action: REMOVE_SANDWICH,
    payload: (match) => parseInt(match[0][1])
  },
  {
    matcher: /I pop the top of sandwich '(.*)'/gm,
    action: POP_INGREDIENT,
    payload: (match) => match[0][1]
  },
  {
    matcher: /I change the name of sandwich #(.*) to '(.*)'/gm,
    action: CHANGE_SANDWICH_NAME,
    payload: (match) => {
      return {index: parseInt(match[0][1]), sandwichName: (match[0][2]) };
    }
  },
  {
    matcher: /I change the gratuity name to '(.*)'/gm,
    action: CHANGE_GRATUITY,
    payload: (match) => parseInt(match[0][1])
  },
  {
    matcher: /I change the staged sandwich name to '(.*)'/gm,
    action: CHANGE_STAGED_SANDWICH_NAME,
    payload: (match) => match[0][1]
  },
  {
    matcher: /I select the ingredient '(.*)' for '(.*)'/gm,
    action: SELECT_INGREDIENT_TO_PUSH,
    payload: (match) => {
      return { sandwichName: match[0][2], ingredientId: parseInt(match[0][1]) }
    }
  },
  {
    matcher: /I push the selected ingredient for sandwich '(.*)'/gm,
    action: PUSH_INGREDIENT,
    payload: (match) => parseInt(match[0][1])
  },
  {
    matcher: /I add the sandwich/gm,
    action: ADD_SANDWICH,
    payload: () => true
  }
]
</code></pre>
</div>

<div id="thens" class="tabcontent">
<pre><code>
export default [
  {
    matcher: /ingredients #(.*) should have amount (.*)/gm,
    assert: (match, computed) => {
      assert.equal(
        computed.ingredients.find((i) => i.id === parseInt(match[0][1])).amount,
        parseInt(match[0][2])
      )
    }
  },
  {
    matcher: /sandwich #(.*) should have name '(.*)'/gm,
    assert: (match, computed) => {
      assert.equal(
        computed.sandwiches[parseInt(match[0][1])].name,
        match[0][2]
      )
    }
  },
  {
    matcher: /there should be (.*) sandwiches/gm,
    assert: (match, computed) => {
      assert.equal(
        computed.sandwiches.length,
        parseInt(match[0][1])
      )
    }
  },

  {
    matcher: /sandwich #(.*) should have (.*) ingredients/gm,
    assert: (match, computed) => {
      assert.equal(
        computed.sandwiches[parseInt(match[0][1])].recipe.length,
        parseInt(match[0][2])
      )
    }
  },

  {
    matcher: /the running tally for ingredient '(.*)' should be '(.*)'/gm,
    assert: (match, computed) => { assert.equal(computed.runningTally[match[0][1]], parseInt(match[0][2])) }
  },
  {
    matcher: /the gratuity should be '(.*)'/gm,
    assert: (match, computed) => assert.equal(computed.gratuity, parseInt(match[0][1]))
  },
  {
    matcher: /sandwich #(.*) should have name '(.*)'/gm,
    assert: (match, computed) => {
      assert.equal(computed.sandwiches[parseInt(match[0][1])].name, match[0][2] )
    }
  }

]
</code></pre>
</div>

</div>


## Pros and Cons

Whats NOT so great about this approach? Well, you aren't necessarily testing the view, so if you are doing crazy stateful things in the view, these tests may give you false security. You can't test more than 1 store- luckily most apps have but 1. And you can't test inter-connected systems- you can only make a redux store, appy actions to it and then examine the results of a selector based on the new state. But you know what's awesome about this approach? It's _fast._ Fast enough to run in the background and run like unit-tests. Were they integration tests, my cucumber steps might have taken multiple minutes to boot up, login and start poking links via Selenium. But by testing just the store and selector, my entire suite of 20 cucumber scenarios can be ran in 75 milliseconds. We can do pseudo-integration-ish tests orders of magnitudes faster than their bigger counterparts. It's fast enough to be watched and run during a dev's coding process, like unit tests, but it tests deep, stateful logic, not just trivial "functional" logic. _It turns troublesome stateful tests *into* trivial functional tests._ It's all wrapped up in a psuedo-cucumber syntax which is simple enough for a non-technical stakeholders to contribute to but easy for coders to parse.

## What kind of test is this?

The say one of the hardest parts of programming is naming the thing. I'm open to ideas- I thought maybe it should involve the prefix 're' a la "redux", "react", and "reselect", but in other languages, you might adopt similar strategies for different implementations of selectors and stores. So I'm hoping that a new testing strategy called "Selected State tests" will now sit on the shelf, next to "Unit tests" and "Integration tests".

## Coda

Developers are lazy, for good or for bad. If they _must_ write tests, often they write silly tests. I know I did. Our CI process would kickback any PR that didn't meet the testing threshold and I'd be forced to write a test, _any_ test, to get the PR merged. Not a usefull test, mind you. Just a test which was previously NOT tested. 

This is not good. It's not _supposed_ to be like that, at all!

But here's the thing: when the test is usefull, the devs will write them. To a dev, the test is just a thing to be solved, like any other code, a means to an end. And if the test helps get the job done, devs will employ them. Devs don't like to manually test the application, and they _really_ don't like being woke up in the middle of the night because the server caught on fire. It behooves us to write good code, not just fancy code or slinging the equivelant of EMCA dogfood, but _reliable_ engineering that does what it says on the tin without falling over. We owe it to the user's and to ourselves.

Here's the demo [Burger Lord](https://adamwong246.github.io/Burger_Lord/) and here's [the code](https://github.com/adamwong246/Burger_Lord).

<script>
function openCity(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

document.querySelectorAll('.tab > button:first-child').forEach((b) => b.click())

</script>
