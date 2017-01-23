# Flexi-dsl

[![npm version](https://badge.fury.io/js/flexi-dsl.svg)](http://badge.fury.io/js/flexi-dsl)
[![Ember Observer Score](http://emberobserver.com/badges/flexi-dsl.svg)](http://emberobserver.com/addons/flexi-dsl)
[![Build Status](https://travis-ci.org/html-next/flexi-dsl.svg)](https://travis-ci.org/html-next/flexi-dsl)
[![Code Climate](https://codeclimate.com/github/html-next/flexi-dsl/badges/gpa.svg)](https://codeclimate.com/github/html-next/flexi-dsl)

Attribute conversions for the flexi-style elements. Note that no CSS is included
with flexi-dsl. For the default CSS install [flexi-default-styles](https://github.com/html-next/flexi-default-styles).

### Installation

It is recommended that you manage your flexi addons through [the main flexi addon](https://github.com/html-next/flexi):

```cli
ember install flexi
```

This will provide a prompt to install only the addons you want. Flexi will also maintain
compatibility between addons.


### Layout Attributes

Layout attributes are converted to classes at build time, giving you the
convenience of a nice attribute syntax and the performance of class based
selectors.

```hbs
<box
  justify="start|end|center|between|around"
  align="start|end|stretch|center|baseline"
  fit
  fill
  vertical
  horizontal
  wrap
  nowrap>
```

[Read More](https://html-next.github.io/flexi/#/docs/layout-attributes)


### Layout Elements

Layout elements give you a declarative syntax for quickly composing
common layout situations.

```hbs
<centered></centered>
<page></page>
<screen></screen>
<fill></fill>
<box></box>
<hbox></hbox>
<vbox></vbox>
<grid></grid>
```

[Read More](https://html-next.github.io/flexi/#/docs/layout-elements)


### Layout Components

Layout components allow you to use container based breakpoints
instead of @media queries.

NOTE: These are backed by components in [the flexi-layouts addon](https://github.com/html-next/flexi-layouts), which is not a
direct dependency of flexi-dsl.

```hbs
<container></container>
<grid responsive></grid>
```

[Read More](https://html-next.github.io/flexi/#/docs/layout-components)


### Mobile First Grid

With flexi, you can build grids with or without rows. Rows are convenient
for item height resets with flexbox. Columns respond to @media breakpoints,
but they can also respond to the container they are in.

You can choose which css, columns, column classes, gutters, and breakpoints
to include. It's [fully configurable](#config)

These attributes are converted to CSS classes at build time.

**Without rows**
```hbs
<grid>
  <box xs="6" sm="4" md="3" lg="2">
</grid>
```

**With rows**
```hbs
<vbox>  <!-- grid container -->
  <hbox>  <!-- row container -->
    <box xs="6" sm="4" md="3" lg="2"> <!-- row item -->
  </hbox>
</vbox>
```

**Without Columns**
```hbs
<vbox>  <!-- grid container -->
  <hbox>  <!-- row container -->
    <box fit> <!-- sizes to it's content -->
    <box fit>
    <box fit>
    <box> <!-- grows to fill the remaining space -->
  </hbox>
</vbox>
```


### Config

The flexi-config dependency's default blueprint will install `config/flexi.js` with the [default settings](https://github.com/html-next/flexi-config/blob/master/blueprints/flexi-config/files/config/flexi.js).

**Settings**

```js
{
  // the number of columns for the grid
  columns: 12,

  // optional, used for column classes: `${colPrefix}-${breakpointPrefix}-${columnNumber}`
  columnPrefix: 'col',

  // if false, @media css is not included
  includeMediaCSS: true,

  // if false, default element styles are not included
  includeElementCSS: true,

  // if true, will convert layout attributes on non-layout elements to classes as well
  transformAllElementLayoutAttributes: false,

  // grid and layout element gutters
  gutterPadding: '.5rem',

  // if false, no styles are included (trumps `includeMediaCSS` and `includeElementCSS`)
  includeCSS: true,

  // an array of breakpoints to use in your app (see below)
  breakpoints: []
}
```

**config.breakpoints**

Your config must have a `breakpoints` array.  A breakpoint has the structure:

```js
  { name: 'mobile', prefix: 'xs', begin: 0 }
```

`name` will be used for blueprint generation of layout names, and is made available as an `is<Name>`
boolean on the `device/layout` service.

`prefix` is a shorthand for the breakpoint name used for column attributes, classes, and responsive utilities.
With a `prefix` of `xs`.

`begin` is the pixel value at which the breakpoint becomes valid if equal to or larger than.

**Using a breakpoint's prefix**

`.col-xs-1` ... `.col-xs-n` will be valid class names (if `columnPrefix` is set to `col`).
```html
<box xs="n visible vertical">
```

Is valid shorthand for
```html
<box class="col-xs-n visible-xs vertical-xs">
```

The following responsive utilities are made available for each prefix:

```css
.hidden-xs,
.visible-xs,
.container-xs,
.vertical-xs,
.horizontal-xs,
.wrap-xs,
.nowrap-xs {}
```

[Read More](https://html-next.github.io/flexi/#/docs/settings)


## Support, Questions, Collaboration

Join the [flexi](https://embercommunity.slack.com/messages/e-flexi/) channel on Slack.

[![Slack Status](https://ember-community-slackin.herokuapp.com/badge.svg)](https://ember-community-slackin.herokuapp.com/)


## Contributing

 - Open an Issue for discussion first if you're unsure a feature/fix is wanted.
 - Branch off of `develop` (default branch)
 - Use descriptive branch names (e.g. `<type>/<short-description>`)
 - Use [Angular Style Commits](https://github.com/angular/angular.js/blob/v1.4.8/CONTRIBUTING.md#commit)
 - PR against `develop` (default branch).

### Commmits

Angular Style commit messages have the full form:

 ```cli
 <type>(<scope>): <title>

 <body>

 <footer>
 ```

 But the abbreviated form (below) is acceptable and often preferred.

 ```cli
 <type>(<scope>): <title>
 ```

 Examples:

 - chore(deps): bump deps in package.json and bower.json
 - docs(component): document the `fast-action` component

## Thanks

A special thanks goes out to [@ebryn](https://github.com/ebryn) for the
inspiration to pursue a solution for explicit layouts, and [IsleofCode](https://isleofcode.com)
for providing the time to built it.
