import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('attribute-expansion', 'Integration | Component | attribute expansion', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`<box align="center" vertical sm="12 visible horizontal wrap" md="align=end"></box>`);

  let box = this.$().find('box').get(0);

  assert.equal(
    box.tagName.toLowerCase(),
    'box',
    `We rendered the <box>: ${box.outerHTML}`);
  assert.equal(
    box.className,
    'align-end-md col-sm-12 visible-sm horizontal-sm wrap-sm flexi-vertical align-center',
    `We rendered the right class names: ${box.outerHTML}`);

  this.render(hbs`<hbox fit class="something"></hbox>`);

  let hbox = this.$().find('hbox').get(0);

  assert.equal(
    hbox.tagName.toLowerCase(),
    'hbox',
    `We rendered the <hbox>: ${hbox.outerHTML}`);
  assert.equal(
    hbox.className,
    'something flexi-fit',
    `We rendered the right class names and didn't clobber existing classes: ${hbox.outerHTML}`);
});
