import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('attribute-expansion', 'Integration | Component | attribute expansion', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`<box align="center" vertical sm="12 visible horizontal wrap"></box>`);

  let box = this.$().find('box').get(0);

  assert.equal(
    box.tagName.toLowerCase(),
    'box',
    `We rendered the <box>: ${box.outerHTML}`);
  assert.equal(
    box.className,
    'flexi-vertical align-center col-sm-12 visible-sm horizontal-sm wrap-sm',
    `We rendered the right class names: ${box.outerHTML}`);
});
