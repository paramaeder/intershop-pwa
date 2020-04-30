import { VariationProductView } from 'ish-core/models/product-view/product-view.model';

import { ProductVariationHelper } from './product-variation.helper';

const variationProduct = {
  sku: '222',
  productMasterSKU: 'M111',
  variableVariationAttributes: [
    { name: 'Attr 1', type: 'VariationAttribute', value: 'A', variationAttributeId: 'a1' },
    { name: 'Attr 2', type: 'VariationAttribute', value: 'A', variationAttributeId: 'a2' },
  ],
  productMaster: () => ({
    sku: 'M111',
    variationAttributeValues: [
      { name: 'Attr 1', type: 'VariationAttribute', value: 'A', variationAttributeId: 'a1' },
      { name: 'Attr 1', type: 'VariationAttribute', value: 'B', variationAttributeId: 'a1' },
      { name: 'Attr 2', type: 'VariationAttribute', value: 'A', variationAttributeId: 'a2' },
      { name: 'Attr 2', type: 'VariationAttribute', value: 'B', variationAttributeId: 'a2' },
      { name: 'Attr 2', type: 'VariationAttribute', value: 'C', variationAttributeId: 'a2' },
    ],
  }),
  variations: () => [
    {
      sku: '222',
      variableVariationAttributes: [
        { name: 'Attr 1', type: 'VariationAttribute', value: 'A', variationAttributeId: 'a1' },
        { name: 'Attr 2', type: 'VariationAttribute', value: 'A', variationAttributeId: 'a2' },
      ],
    },
    {
      sku: '333',
      attributes: [{ name: 'defaultVariation', type: 'Boolean', value: true }],
      variableVariationAttributes: [
        { name: 'Attr 1', type: 'VariationAttribute', value: 'A', variationAttributeId: 'a1' },
        { name: 'Attr 2', type: 'VariationAttribute', value: 'B', variationAttributeId: 'a2' },
      ],
    },
    {
      sku: '444',
      variableVariationAttributes: [
        { name: 'Attr 1', type: 'VariationAttribute', value: 'B', variationAttributeId: 'a1' },
        { name: 'Attr 2', type: 'VariationAttribute', value: 'A', variationAttributeId: 'a2' },
      ],
    },
    {
      sku: '555',
      variableVariationAttributes: [
        { name: 'Attr 1', type: 'VariationAttribute', value: 'B', variationAttributeId: 'a1' },
        { name: 'Attr 2', type: 'VariationAttribute', value: 'B', variationAttributeId: 'a2' },
      ],
    },
    {
      sku: '666',
      variableVariationAttributes: [
        { name: 'Attr 1', type: 'VariationAttribute', value: 'B', variationAttributeId: 'a1' },
        { name: 'Attr 2', type: 'VariationAttribute', value: 'C', variationAttributeId: 'a2' },
      ],
    },
  ],
} as VariationProductView;

describe('Product Variation Helper', () => {
  it('should build variation option groups for variation product', () => {
    const expectedGroups = [
      {
        id: 'a1',
        label: 'Attr 1',
        options: [
          {
            label: 'A',
            value: 'A',
            type: 'a1',
            alternativeCombination: false,
            active: true,
          },
          {
            label: 'B',
            value: 'B',
            type: 'a1',
            alternativeCombination: false,
            active: false,
          },
        ],
      },
      {
        id: 'a2',
        label: 'Attr 2',
        options: [
          {
            label: 'A',
            value: 'A',
            type: 'a2',
            alternativeCombination: false,
            active: true,
          },
          {
            label: 'B',
            value: 'B',
            type: 'a2',
            alternativeCombination: false,
            active: false,
          },
          {
            label: 'C',
            value: 'C',
            type: 'a2',
            alternativeCombination: true,
            active: false,
          },
        ],
      },
    ];

    const result = ProductVariationHelper.buildVariationOptionGroups(variationProduct);
    expect(result).toEqual(expectedGroups);
  });

  it('should find possible variation on variation option group selection', () => {
    // perfect match
    expect(
      ProductVariationHelper.findPossibleVariationForSelection({ a1: 'A', a2: 'B' }, variationProduct).sku
    ).toEqual('333');

    // possible varations
    expect(
      ProductVariationHelper.findPossibleVariationForSelection({ a1: 'A', a2: 'C' }, variationProduct).sku
    ).toEqual('333');

    expect(
      ProductVariationHelper.findPossibleVariationForSelection({ a1: 'A', a2: 'C' }, variationProduct, 'a1').sku
    ).toEqual('333');

    expect(
      ProductVariationHelper.findPossibleVariationForSelection({ a1: 'A', a2: 'C' }, variationProduct, 'a2').sku
    ).toEqual('666');
  });
});
