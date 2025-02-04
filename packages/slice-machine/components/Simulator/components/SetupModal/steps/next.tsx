import {
  InstallSliceSimulator,
  CreatePage,
  UpdateSmJson,
  SetupStepperConfiguration,
} from "./common";
import {
  CreateRouteJsExcerpt,
  InstallExcerpt,
  UpdateSmJsonExcerpt,
} from "./excerpts";

const CreatePageInstructions = {
  code: `import { SliceSimulator } from "@prismicio/slice-simulator-react";
import { SliceZone } from "@prismicio/react";

import { components } from "../slices";

const SliceSimulatorPage = () => (
  <SliceSimulator
    sliceZone={({ slices }) => (
      <SliceZone slices={slices} components={components} />
    )}
    state={{}}
  />
);

export default SliceSimulatorPage;`,
};

const steps = [
  InstallSliceSimulator({
    npm: `npm install --save @prismicio/react @prismicio/slice-simulator-react @prismicio/client@latest @prismicio/helpers`,
    yarn: `yarn add @prismicio/react @prismicio/slice-simulator-react @prismicio/client@latest @prismicio/helpers`,
  }),
  CreatePage(CreatePageInstructions),
  UpdateSmJson({}),
];

const NextStepper: SetupStepperConfiguration = {
  steps,
  excerpts: [InstallExcerpt, CreateRouteJsExcerpt, UpdateSmJsonExcerpt],
};

export default NextStepper;
