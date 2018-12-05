# 📚 Anthology.scss

> A SCSS library for creating scaleable, brand-driven, atomic styles

## Install
```sh
yarn add anthology.scss
```
or
```sh
npm install anthology.scss
```

## SCSS

### `A(...)`

Anthology _mixins_ and _functions_ are called via this primary interface. For example, you can `@include A( {foo}, {args...} );` or set `$bar: A( {baz}, {args...} );`.

### Mixins

#### `A(configure, $config)`

##### Params
```
{Map} $config.breakpoints - A map of responsive breakpoints [default: null].
{String} $config.separator - A string delimiter which appears between each piece of the generated selectors [default: '-'].
{String} $config.important-tag - A string which designates '!important' rules [default: '!'].
{String} $config.theme-tag - A string which designates themed rules [default: '#'].
{String} $config.responsive-tag - A string which designates responsive rules [default: '@'].
{String} $config.grid-prefix - A string which prefixes Anthology-generated grids [default: 'grid'].
{String} $config.grid-area-prefix - A string which prefixes 'grid-area' rules for Anthology-generated grids [default: 'area'].
```

##### Usage

Configures Anthology with options for responsive breakpoints and syntax tags.
