# Unit tests conventions

## [Jest React Tutorial](https://jestjs.io/docs/tutorial-react)

### Library
We use the [React Testing Library](https://github.com/testing-library/react-testing-library) that is a very lightweight
solution for testing React components. It provides light utility functions on top of `react-dom` and
`react-dom/test-utils`, in a way that encourages better testing practices.

### Conventions
> Note: Some conventions were obtained from [this article](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
> written by the creator of the library.

- [Moving the component render to a function](#moving-the-component-render-to-a-function)
- [Using `cleanup`](#using-cleanup)
- [Not using `screen`](#not-using-screen)
- [Using the wrong assertion](#using-the-wrong-assertion)
- [Wrapping things in `act` unnecessarily](#wrapping-things-in-act-unnecessarily)
- [Using the wrong query](#using-the-wrong-query)
    * [Using container to query for elements](#using-container-to-query-for-elements)
    * [Not querying by text](#not-querying-by-text)
    * [Not using `*ByRole` most of the time](#not-using-byrole-most-of-the-time)
- [Adding aria-, role, and other accessibility attributes incorrectly](#adding-aria-role-and-other-accessibility-attributes-incorrectly)
- [Not using @testing-library/user-event](#not-using-testing-library-user-event)
- [Using `query*` variants for anything except checking for non-existence](#using-query-variants-for-anything-except-checking-for-non-existence)
- [Using `waitFor` to wait for elements that can be queried with `find*`](#using-waitfor-to-wait-for-elements-that-can-be-queried-with-find)
- [Passing an empty callback to `waitFor`](#passing-an-empty-callback-to-waitfor)
- [Having multiple assertions in a single `waitFor` callback](#having-multiple-assertions-in-a-single-waitfor-callback)
- [Performing side-effects in `waitFor`](#performing-side-effects-in-waitfor)
- [Using `get*` variants as assertions](#using-get-variants-as-assertions)


### Cheatsheet
- [Query type by role](#query-type-by-role)
    * [Input](#input)
    * [Button](#button)
    * [Text in a div](#text-in-a-div)
    * [Label](#label)
    * [Heading](#heading)

---

#### Moving the component render to a function
:x:
```js
test("behavior 1", () => {
    const { ... } = render(<Example
                               data={mockData1}
                             />);
    ... asserts here ...
});

test("behavior 2", () => {
    const { ... } = render(<Example
                               data={mockData2}
                             />);
    ... asserts here ...
});
```

:white_check_mark:
```js
function renderExample(data) {
  return render(
      <Example
         data={data}
       />);
}

test("behavior 1", () => {
    const { ... } = renderExample(mockData1);
    ... asserts here ...
});

test("behavior 2", () => {
    const { ... } = renderExample(mockData2);
    ... asserts here ...
});
```

When you are testing different behaviors of one component, it is a good practice to move the render of the component to
a function, to avoid duplicated code.

> Move the render of the component to a function, to avoid duplicated code.

#### Using `cleanup`
:x:
```js
import {render, screen, cleanup} from '@testing-library/react'
afterEach(cleanup)
```

:white_check_mark:
```js
import {render, screen} from '@testing-library/react'
```

For a long time now cleanup happens automatically (supported for most major testing frameworks) and you no longer need 
to worry about it. [Learn more](https://testing-library.com/docs/react-testing-library/api#cleanup).

> Don't use `cleanup`

#### Not using `screen`
:x:
```js
const {getByRole} = render(<Example />)
const errorMessageNode = getByRole('alert')
```

:white_check_mark:
```js
render(<Example />)
const errorMessageNode = screen.getByRole('alert')
```
It comes from the same import statement you get `render` from:
```js
import {render, screen} from '@testing-library/react'
```

The benefit of using `screen` is you no longer need to keep the render call destructure up-to-date as you add/remove 
the queries you need. You only need to type `screen.` and let your editor's magic autocomplete take care of the rest.

You can also call [screen.debug](https://testing-library.com/docs/dom-testing-library/api-queries#screendebug) instead 
of `debug`.

> Use `screen` for querying and debugging.

#### Using the wrong assertion
```js
const button = screen.getByRole('button', {name: /disabled button/i})
```

:x:
```js
expect(button.disabled).toBe(true)
// error message:
//  expect(received).toBe(expected) // Object.is equality
//
//  Expected: true
//  Received: false
```

:white_check_mark:
```js
expect(button).toBeDisabled()
// error message:
//   Received element is not disabled:
//     <button />
```

That `toBeDisabled` assertion comes from [jest-dom](https://github.com/testing-library/jest-dom). It's strongly
recommended to use `jest-dom` because the error messages you get with it are much better.

> Install and use [@testing-library/jest-dom](https://github.com/testing-library/jest-dom)

#### Wrapping things in `act` unnecessarily
:x:
```js
act(() => {
  render(<Example />)
})
const input = screen.getByRole('textbox', {name: /choose a fruit/i})
act(() => {
  fireEvent.keyDown(input, {key: 'ArrowDown'})
})
```

:white_check_mark:
```js
render(<Example />)
const input = screen.getByRole('textbox', {name: /choose a fruit/i})
fireEvent.keyDown(input, {key: 'ArrowDown'})
```

Most of the time, if you're seeing an `act` warning, it's not just something to be silenced, but it's actually telling
you that something unexpected is happening in your test. You can learn more about this [here](https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning).

> Learn when `act` is necessary and don't wrap things in act unnecessarily.

#### Using the wrong query
:x:
```js
// assuming you've got this DOM to work with:
// <label>Username</label><input data-testid="username" />
screen.getByTestId('username')
```

:white_check_mark:
```js
// change the DOM to be accessible by associating the label and setting the type
// <label for="username">Username</label><input id="username" type="text" />
screen.getByRole('textbox', {name: /username/i})
```

To know all the available queries to use, check [this page](https://testing-library.com/docs/guide-which-query).

##### Using container to query for elements

Sub-section of "Using the wrong query".

:x:
```js
const {container} = render(<Example />)
const button = container.querySelector('.btn-primary')
expect(button).toHaveTextContent(/click me/i)
```

:white_check_mark:
```js
render(<Example />)
screen.getByRole('button', {name: /click me/i})
```

You want to ensure that your users can interact with your UI and if you query around using `querySelector` we lose a lot
of that confidence, the test is harder to read, and it will break more frequently.

##### Not querying by text

Sub-section of "Using the wrong query". Is recommended to query by the actual text (in the case of localization,
is recommended to use the default locale), rather than using test IDs or other mechanisms everywhere.

:x:
```js
screen.getByTestId('submit-button')
```

:white_check_mark:
```js
screen.getByRole('button', {name: /submit/i})
```

If you don't query by the actual text, then you have to do extra work to make sure that your translations are getting
applied correctly.
So the cost is pretty low, and the benefit is you get increased confidence that your translations are applied
correctly and your tests are easier to write and read.

##### Not using `*ByRole` most of the time

Sub-section of "Using the wrong query".
The name option allows you to query elements by their ["Accessible Name"](https://www.w3.org/TR/accname-1.1/) which
is what screen readers will read for the element and it works even if your element has its text content split up by
different elements. For example:

```js
// assuming we've got this DOM structure to work with
// <button><span>Hello</span> <span>World</span></button>
```
:x:
```js
screen.getByText(/hello world/i)
// fails with the following error:
// Unable to find an element with the text: /hello world/i. This could be
// because the text is broken up by multiple elements. In this case, you can
// provide a function for your text matcher to make your matcher more flexible.
```

:white_check_mark:
```js
screen.getByRole('button', {name: /hello world/i})
// works!
```
One reason people don't use `*ByRole` queries is because they're not familiar with the implicit roles placed on elements.
[Here's a list of Roles on MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles).
If an element is can't be found the `*ByRole` queries will log all the available roles you can query by.

> Read and follow the recommendations on the [The "Which Query Should I Use" Guide](https://testing-library.com/docs/guide-which-query).

#### Adding aria-, role, and other accessibility attributes incorrectly
:x:
```js
render(<button role="button">Click me</button>)
```

:white_check_mark:
```js
render(<button>Click me</button>)
```

Slapping accessibility attributes willy-nilly is not only unnecessary (as in the case above), but it can also 
confuse screen readers and their users. The accessibility attributes should really only be used when semantic HTML 
doesn't satisfy your use case 

Note: to make `inputs` accessible via a "role" you'll want to specify the `type` attribute!

> Avoid adding unnecessary or incorrect accessibility attributes.

#### Not using @testing-library/user-event
:x:
```js
fireEvent.change(input, {target: {value: 'hello world'}})
```

:white_check_mark:
```js
userEvent.type(input, 'hello world')
```
[@testing-library/user-event](https://github.com/testing-library/user-event) is a package built on top of `fireEvent`, 
but it provides several methods that resemble the user interactions more closely. In the example above, `fireEvent.change` 
will simply trigger a single change event on the input. However, the `type` call, will trigger `keyDown`, `keyPress`, and 
`keyUp` events for each character as well. It's much closer to the user's actual interactions. This has the benefit of 
working well with libraries that you may use which don't actually listen for the change event.

> Use `@testing-library/user-event` over `fireEvent` where possible.

#### Using `query*` variants for anything except checking for non-existence
:x:
```js
expect(screen.queryByRole('alert')).toBeInTheDocument()
```

:white_check_mark:
```js
expect(screen.getByRole('alert')).toBeInTheDocument()
expect(screen.queryByRole('alert')).not.toBeInTheDocument()
```
The only reason the `query*` variant of the queries is exposed is for you to have a function you can call which does not 
throw an error if no element is found to match the query (it returns `null` if no element is found). The only reason this 
is useful is to verify that an element is not rendered to the page.

> Only use the `query*` variants for asserting that an element cannot be found.

#### Using `waitFor` to wait for elements that can be queried with `find*`
:x:
```js
const submitButton = await waitFor(() =>
  screen.getByRole('button', {name: /submit/i}),
)
```

:white_check_mark:
```js
const submitButton = await screen.findByRole('button', {name: /submit/i})
```
Those two bits of code are basically equivalent (`find*` queries use `waitFor` under the hood), but the second is 
simpler and the error message you get will be better.

> Use `find*` any time you want to query for something that may not be available right away.

#### Passing an empty callback to `waitFor`
:x:
```js
await waitFor(() => {})
expect(window.fetch).toHaveBeenCalledWith('foo')
expect(window.fetch).toHaveBeenCalledTimes(1)
```

:white_check_mark:
```js
await waitFor(() => expect(window.fetch).toHaveBeenCalledWith('foo'))
expect(window.fetch).toHaveBeenCalledTimes(1)
```
The purpose of `waitFor` is to allow you to wait for a specific thing to happen. If you pass an empty callback it might 
work today because all you need to wait for is "one tick of the event loop" thanks to the way your mocks work. 
But you'll be left with a fragile test which could easily fail if you refactor your async logic.

> Wait for a specific assertion inside `waitFor`.

#### Having multiple assertions in a single `waitFor` callback
:x:
```js
await waitFor(() => {
  expect(window.fetch).toHaveBeenCalledWith('foo')
  expect(window.fetch).toHaveBeenCalledTimes(1)
})
```

:white_check_mark:
```js
await waitFor(() => expect(window.fetch).toHaveBeenCalledWith('foo'))
expect(window.fetch).toHaveBeenCalledTimes(1)
```
Let's say that for the example above, `window.fetch` was called twice. So the `waitFor` call will fail, however, we'll have 
to wait for the timeout before we see that test failure. By putting a single assertion in there, we can both wait for 
the UI to settle to the state we want to assert on, and also fail faster if one of the assertions do end up failing.

> Only put one assertion in a callback.

#### Performing side-effects in `waitFor`
:x:
```js
await waitFor(() => {
  fireEvent.keyDown(input, {key: 'ArrowDown'})
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})
```

:white_check_mark:
```js
fireEvent.keyDown(input, {key: 'ArrowDown'})
await waitFor(() => {
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})
```

`waitFor` is intended for things that have a non-deterministic amount of time between the action you performed and the 
assertion passing. Because of this, the callback can be called (or checked for errors) a non-deterministic number of times 
and frequency (it's called both on an interval as well as when there are DOM mutations). So this means that your side-effect 
could run multiple times!

This also means that you can't use snapshot assertions within `waitFor`. If you do want to use a snapshot assertion, 
then first wait for a specific assertion, and then after that you can take your snapshot.

> Put side-effects outside `waitFor` callbacks and reserve the callback for assertions only.

#### Using `get*` variants as assertions
:x:
```js
screen.getByRole('alert', {name: /error/i})
```

:white_check_mark:
```js
expect(screen.getByRole('alert', {name: /error/i})).toBeInTheDocument()
```
If `get*` queries are unsuccessful in finding the element, they'll throw a really helpful error message that shows you 
the full DOM structure (with syntax highlighting) which will help you during debugging. Because of this, the assertion 
could never possibly fail (because the query will throw before the assertion has a chance to).

> If you want to assert that something exists, make that assertion explicit.

---

#### Query type by role
This is a brief cheatsheet to know which query you should use for each element type.

##### Input
When you are trying to get an input use [ByDisplayValue](https://testing-library.com/docs/dom-testing-library/api-queries#bydisplayvalue).

##### Button
The easiest way to get a button is using [ByRole](https://testing-library.com/docs/dom-testing-library/api-queries#byrole). 
The first parameter should be `"button"`.

##### Text in a div
To get a text in a div, a text that is not in a label tag, use [ByText](https://testing-library.com/docs/dom-testing-library/api-queries#bytext).

##### Label
This element has two different ways to be obtained, sometimes the first one doesn't work due the structure, 
and you should use the second one.
1. [ByText](https://testing-library.com/docs/dom-testing-library/api-queries#bytext): Easiest way to obtain a text in a label.
It doesn't always work.
2. [ByLabelText](https://testing-library.com/docs/dom-testing-library/api-queries#bylabeltext): It's mostly used to get labels 
with a text, but it also work if we add aria-label="my-label-id" and getByLabelText using that id.

```js
<label
  className={this.state.checked ? "switch-label on" : "switch-label off"}
  id="switchLabelId"
  htmlFor={this.props.id}
  aria-label={this.props.id}>
  <span className="switch-button"/>
</label>

//this.props.id === "switchId"

expect(screen.getByLabelText("switchId")).toHaveClass("switch-label off");
```

##### Heading
To get a heading we need to use [ByRole](https://testing-library.com/docs/dom-testing-library/api-queries#level).
The first parameter should be `"heading"` and then you have to specify the level.

```js
// Obtaining a <h2/> element
expect(screen.getByRole("heading", {level: 2, name: "myTitle"})).toBeInTheDocument();
```
