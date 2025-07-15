---
title: Getting started with testeranto
publishedAt: Sun Mar 23 2025 09:11:14 GMT-0700 (Pacific Daylight Time)
---

So you want to add testeranto to your project? 

### 1) add the `testeranto` package to your project
```
npm install testeranto
```
or
```
yarn install testeranto
```

###  2) initializing your project

This command will scaffold out a config file and some output directories.
```
yarn tsx node_modules/testeranto/bin/init-docs.js
```

###  3) Create the subject of your test.

Every test needs a subject- the thing-being-tested, rather than the test itself. Any piece of ecmascript can be the subject of a testeranto test. For this example, lets create a [`Rectangle` class](https://github.com/ChromaPDX/kokomoBay/blob/631428153e654c657bc2ee919303fd2a992155d0/src/Rectangle.ts) as the subject.

``` ts
class Rectangle {
  height: number;
  width: number;

  constructor(height: number = 2, width: number = 2) {
    this.height = height;
    this.width = width;
  }

  getHeight() {
    return this.height;
  }

  getWidth() {
    return this.width;
  }

  setHeight(height: number): void {
    this.height = height;
  }

  setWidth(width: number): void {
    this.width = width;
  }

  area(): number {
    return this.width * this.height;
  }

  circumference(): number {
    return 2 * (this.width + this.height);
  }
}

export default Rectangle;
```

###  4) the test "shape"

Every testeranto test has an "shape" describing the necessary type signatures. In this example, we have the file [Rectangle.test.shape.ts](https://github.com/ChromaPDX/kokomoBay/blob/2d8abde977c5ba3ce57e97ac474b39cf01ec37b6/src/Rectangle.test.shape.ts)


``` ts
export type IRectangleTestShape = {
  iinput: Rectangle;
  isubject: Rectangle;
  istore: Rectangle;
  iselection: Rectangle;

  when: (rectangle: Rectangle) => any;
  then: unknown;
  given: (x) => (y) => unknown;

  suites: {
    Default: [string];
  };
  givens: {
    Default;
    WidthOfOneAndHeightOfOne;
    WidthAndHeightOf: [number, number];
  };
  whens: {
    HeightIsPubliclySetTo: [number];
    WidthIsPubliclySetTo: [number];
    setWidth: [number];
    setHeight: [number];
  };
  thens: {
    AreaPlusCircumference: [number];
    circumference: [number];
    getWidth: [number];
    getHeight: [number];
    area: [number];
    prototype: [string];
  };
  checks: {
    Default;
    WidthOfOneAndHeightOfOne;
    WidthAndHeightOf: [number, number];
  };
};
```

###  5) The test "specification"

Every test has as [specification](https://github.com/ChromaPDX/kokomoBay/blob/2d8abde977c5ba3ce57e97ac474b39cf01ec37b6/src/Rectangle.test.specification.ts) which acts is the pure logic of a BDD test. This piece of code is gherkin-like Behavior Driven DSL which described the behavior of a piece of code, but none of it's implementation details. It is designed to be comprehensible to non-coding stakeholders.
``` ts
export const RectangleTesterantoBaseTestSpecification: ITestSpecification<
  IRectangleTestShape
> = (Suite, Given, When, Then, Check) => {
  return [
    Suite.Default(
      "Testing the Rectangle class",
      {
        test0: Given.Default(
          ["https://api.github.com/repos/adamwong246/testeranto/issues/8"],
          [When.setWidth(4), When.setHeight(9)],
          [Then.getWidth(4), Then.getHeight(9)]
        ),
      },
    ),
  ];
};
```

###  6) The test "interface"

Inverse of the "specifcation" is the [interface](https://github.com/ChromaPDX/kokomoBay/blob/2d8abde977c5ba3ce57e97ac474b39cf01ec37b6/src/Rectangle.test.interface.ts). The "interface" is only implementation details, but no BDD logic. 

``` ts
export const RectangleTesterantoBaseInterface: IPartialInterface<IRectangleTestShape> =
  {
    beforeEach: async (subject, initializer, art, tr, initialValues) => {
      return subject;
    },
    andWhen: async function (renderer, actioner) {
      actioner(renderer);
      return renderer;
    },
    butThen: (s, t, tr) => {
      return t(s);
    },
  };
```

###  7) The test "implementation"

Every test has an [implementation](https://github.com/ChromaPDX/kokomoBay/blob/2d8abde977c5ba3ce57e97ac474b39cf01ec37b6/src/Rectangle.test.implementation.ts) which acts is the "glue" between the interface and the specification.
``` ts
export const RectangleTesterantoBaseTestImplementation: ITestImplementation<IRectangleTestShape, Rectangle> = {
  suites: {
    Default: "a default suite",
  },

  givens: {
    Default: () => new Rectangle(2, 2),
    WidthOfOneAndHeightOfOne: () => new Rectangle(1, 1),
    WidthAndHeightOf: (width: number, height: number) => new Rectangle(width, height),
  },

  whens: {
    HeightIsPubliclySetTo: (height: number) => async (rectangle: Rectangle, utils: PM) => {
      rectangle.setHeight(height);
      return rectangle;
    },
    WidthIsPubliclySetTo: (width: number) => async (rectangle: Rectangle, utils: PM) => {
      rectangle.setWidth(width);
      return rectangle;
    },
    setWidth: (width: number) => async (rectangle: Rectangle, utils: PM) => {
      rectangle.setWidth(width);
      return rectangle;
    },
    setHeight: (height: number) => async (rectangle: Rectangle, utils: PM) => {
      rectangle.setHeight(height);
      return rectangle;
    },
  },

  thens: {
    AreaPlusCircumference: (combined: number) => (rectangle: Rectangle) => {
      assert.equal(rectangle.area() + rectangle.circumference(), combined);
      return rectangle;
    },
    getWidth: (expectedWidth: number) => (rectangle: Rectangle) => {
      assert.equal(rectangle.getWidth(), expectedWidth);
      return rectangle;
    },
    getHeight: (expectedHeight: number) => (rectangle: Rectangle) => {
      assert.equal(rectangle.getHeight(), expectedHeight);
      return rectangle;
    },
    area: (area: number) => (rectangle: Rectangle) => {
      assert.equal(rectangle.area(), area);
      return rectangle;
    },
    prototype: (name: string) => (rectangle: Rectangle) => {
      assert.equal(Object.getPrototypeOf(rectangle), Rectangle.prototype);
      return rectangle;
    },
    circumference: (circumference: number) => (rectangle: Rectangle) => {
      assert.equal(rectangle.circumference(), circumference);
      return rectangle;
    },
  },

  checks: {
    /* @ts-ignore:next-line */
    AnEmptyState: () => {
      return {};
    },
  },
};
```

###  8) Create a test entrypoint

Every testeranto test has an entrypoint. In this example, we have the file [Rectangle.test.web.ts](https://github.com/ChromaPDX/kokomoBay/blob/2d8abde977c5ba3ce57e97ac474b39cf01ec37b6/src/Rectangle/Rectangle.test.web.ts)


``` ts
import Rectangle from "../Rectangle";
import { RectangleTesterantoBaseTestSpecification } from "../Rectangle.test.specification";
import { RectangleTesterantoBaseTestImplementation } from "../Rectangle.test.implementation";
import { RectangleTesterantoBasePrototype } from "../Rectangle.test";

export default Testeranto(
  RectangleTesterantoBasePrototype,
  RectangleTesterantoBaseTestSpecification,
  RectangleTesterantoBaseTestImplementation,
  {
    beforeEach: async (
      rectangleProto: Rectangle,
      init: (c?: any) => (x: any) => (y: any) => Rectangle,
      artificer: ITestArtificer,
      tr: ITTestResourceConfiguration,
      initialValues: any,
      pm: PM_Web
    ): Promise<Rectangle> => {
      pm.writeFileSync("beforeEachLog", "bar");
      return rectangleProto;
    },
    afterAll: async (store, artificer, utils) => {
      return new Promise(async (res, rej) => {
        res(store);
      });
    },
    andWhen: async function (
      s: Rectangle,
      whenCB: (s: Rectangle) => Promise<Rectangle>,
      tr: ITTestResourceConfiguration,
      utils: PM_Web
    ): Promise<Rectangle> {
      return whenCB(s);
    },
  },
  {
    ports: 0,
  }
);
```

###  9) Add your test to the config file

You need to [Register your test in the config file](https://github.com/ChromaPDX/kokomoBay/blob/2d8abde977c5ba3ce57e97ac474b39cf01ec37b6/testeranto.mts#L21)

This will register our test to be run in the browser, with no needed ports and no sidecars.
``` ts
  ...
  tests: [
    ...
    ["./src/Rectangle/Rectangle.test.web.ts", "web", { ports: 0 }, []],
  ]
```

###  10) build your tests

``` sh
tsx node_modules/testeranto/dist/prebuild/build-tests.mjs testeranto.mts
```

###  11) run your tests

``` sh
tsx node_modules/testeranto/dist/prebuild/run-tests.mjs testeranto.mts
```

###  12) examine your test results

Running the tests should produce a series of file in [`docs`](https://github.com/ChromaPDX/kokomoBay/tree/2d8abde977c5ba3ce57e97ac474b39cf01ec37b6/docs/web/src/Rectangle/Rectangle.test.web).

###  13) Run the aider prompt to auto-magically fix tests

```
aider --model deepseek  --api-key deepseek=YOUR_SECRET_KEY --load docs/web/src/Rectangle/Rectangle.test.electron/prompt.txt
```

Aider should launch and being fixing any bugs!