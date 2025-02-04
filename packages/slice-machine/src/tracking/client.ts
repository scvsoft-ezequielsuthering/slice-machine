import { Frameworks } from "@slicemachine/core/build/models";
import axios from "axios";
import { LibraryUI } from "../../lib/models/common/LibraryUI";
import {
  EventNames,
  TrackingEvents,
  IdentifyUser,
  GroupLibraries,
  PageView,
  OpenVideoTutorials,
  Review,
  SliceSimulatorSetup,
  SliceSimulatorOpen,
  OnboardingStart,
  OnboardingContinue,
  OnboardingSkip,
  CreateCustomType,
  CustomTypeFieldAdded,
  CustomTypeSliceZoneUpdated,
  CustomTypeSaved,
  CreateSlice,
  ScreenshotTaken,
  ChangesPushed,
  SliceSimulatorIsNotRunning,
  ChangesLimitReach,
} from "../../lib/models/tracking";

export class SMTracker {
  #client = (event: TrackingEvents) =>
    axios.post("/api/s", event).then(() => void 0);
  #isTrackingActive = true;

  initialize(isTrackingActive = true): void {
    this.#isTrackingActive = isTrackingActive;
  }

  /** Private methods **/

  async #trackEvent(event: TrackingEvents): Promise<void> {
    if (!this.#isTrackingActive) {
      return;
    }

    return this.#client(event).catch(() =>
      console.warn(`Couldn't report event ${event.name}: Tracking error`)
    );
  }

  async #identify(): Promise<void> {
    if (!this.#isTrackingActive) {
      return;
    }

    const payload: IdentifyUser = {
      name: EventNames.IdentifyUser,
    };

    return this.#client(payload).catch(() =>
      console.warn(`Couldn't report identify: Tracking error`)
    );
  }

  /** Public methods **/

  async trackPageView(framework: Frameworks): Promise<void> {
    const payload: PageView = {
      name: EventNames.PageView,
      props: {
        url: window.location.href,
        path: window.location.pathname,
        search: window.location.search,
        title: document.title,
        referrer: document.referrer,
        framework,
      },
    };

    await this.#trackEvent(payload);
  }

  async identifyUser(): Promise<void> {
    await this.#identify();
  }

  async groupLibraries(
    libs: readonly LibraryUI[],
    repoName: string | undefined
  ): Promise<void> {
    if (repoName === undefined || !this.#isTrackingActive) {
      return;
    }

    const downloadedLibs = libs.filter((l) => l.meta.isDownloaded);

    const payload: GroupLibraries = {
      name: EventNames.GroupLibraries,
      props: {
        repoName: repoName,
        manualLibsCount: libs.filter((l) => l.meta.isManual).length,
        downloadedLibsCount: downloadedLibs.length,
        npmLibsCount: libs.filter((l) => l.meta.isNodeModule).length,
        downloadedLibs: downloadedLibs.map((l) =>
          l.meta.name != null ? l.meta.name : "Unknown"
        ),
      },
    };

    await this.#client(payload).catch(() =>
      console.warn(`Couldn't report group: Tracking error`)
    );
  }

  async trackClickOnVideoTutorials(
    framework: Frameworks,
    video: string
  ): Promise<void> {
    const payload: OpenVideoTutorials = {
      name: EventNames.OpenVideoTutorials,
      props: {
        framework,
        video,
      },
    };
    await this.#trackEvent(payload);
  }

  async trackReview(
    framework: Frameworks,
    rating: number,
    comment: string
  ): Promise<void> {
    const payload: Review = {
      name: EventNames.Review,
      props: {
        framework,
        rating,
        comment,
      },
    };
    return this.#trackEvent(payload);
  }

  async trackSliceSimulatorSetup(framework: Frameworks): Promise<void> {
    const payload: SliceSimulatorSetup = {
      name: EventNames.SliceSimulatorSetup,
      props: { framework },
    };
    return this.#trackEvent(payload);
  }

  async trackOpenSliceSimulator(framework: Frameworks): Promise<void> {
    const payload: SliceSimulatorOpen = {
      name: EventNames.SliceSimulatorOpen,
      props: { framework },
    };

    return this.#trackEvent(payload);
  }

  async trackSliceSimulatorIsNotRunning(framework: Frameworks): Promise<void> {
    const payload: SliceSimulatorIsNotRunning = {
      name: EventNames.SliceSimulatorIsNotRunning,
      props: { framework },
    };

    return this.#trackEvent(payload);
  }

  async trackOnboardingStart(): Promise<void> {
    const payload: OnboardingStart = {
      name: EventNames.OnboardingStart,
    };
    return this.#trackEvent(payload);
  }

  async trackOnboardingContinue(
    continueOnboardingEventType: OnboardingContinue["name"]
  ): Promise<void> {
    const payload: OnboardingContinue = {
      name: continueOnboardingEventType,
    };
    return this.#trackEvent(payload);
  }

  async trackOnboardingSkip(screenSkipped: number): Promise<void> {
    const payload: OnboardingSkip = {
      name: EventNames.OnboardingSkip,
      props: {
        screenSkipped,
      },
    };

    return this.#trackEvent(payload);
  }

  async trackCreateCustomType(customTypeInfo: {
    id: string;
    name: string;
    repeatable: boolean;
  }): Promise<void> {
    const { id, name, repeatable } = customTypeInfo;

    const payload: CreateCustomType = {
      name: EventNames.CreateCustomType,
      props: { id, name, type: repeatable ? "repeatable" : "single" },
    };

    return this.#trackEvent(payload);
  }

  async trackCustomTypeFieldAdded({
    fieldId,
    customTypeId,
    zone,
    type,
  }: {
    fieldId: string;
    customTypeId: string;
    zone: "static" | "repeatable";
    type: string;
  }): Promise<void> {
    const payload: CustomTypeFieldAdded = {
      name: EventNames.CustomTypeFieldAdded,
      props: {
        id: fieldId,
        name: customTypeId,
        zone,
        type,
      },
    };

    return this.#trackEvent(payload);
  }

  async trackCustomTypeSliceAdded(data: {
    customTypeId: string;
  }): Promise<void> {
    const payload: CustomTypeSliceZoneUpdated = {
      name: EventNames.CustomTypeSliceZoneUpdated,
      props: data,
    };

    return this.#trackEvent(payload);
  }

  async trackCustomTypeSaved(data: {
    id: string;
    name: string;
    type: "single" | "repeatable";
  }): Promise<void> {
    const payload: CustomTypeSaved = {
      name: EventNames.CustomTypeSaved,
      props: data,
    };

    return this.#trackEvent(payload);
  }

  async trackCreateSlice(data: {
    id: string;
    name: string;
    library: string;
  }): Promise<void> {
    const payload: CreateSlice = {
      name: EventNames.SliceCreated,
      props: data,
    };
    return this.#trackEvent(payload);
  }

  async trackScreenshotTaken(data: ScreenshotTaken["props"]): Promise<void> {
    const payload: ScreenshotTaken = {
      name: EventNames.ScreenshotTaken,
      props: data,
    };
    return this.#trackEvent(payload);
  }

  async trackChangesPushed(data: ChangesPushed["props"]): Promise<void> {
    const payload: ChangesPushed = {
      name: EventNames.ChangesPushed,
      props: data,
    };

    return this.#trackEvent(payload);
  }

  async trackChangesLimitReach(
    data: ChangesLimitReach["props"]
  ): Promise<void> {
    const payload: ChangesLimitReach = {
      name: EventNames.ChangesLimitReach,
      props: data,
    };

    return this.#trackEvent(payload);
  }

  #startedNewEditorSession = false;
  editor = {
    startNewSession: () => {
      this.#startedNewEditorSession = true;
    },
    trackWidgetUsed: (sliceId: string) => {
      if (!this.#startedNewEditorSession) return;

      this.#startedNewEditorSession = false;

      void this.#trackEvent({
        name: EventNames.EditorWidgetUsed,
        props: { sliceId },
      });
    },
  };
}

const Tracker = (() => {
  let smTrackerInstance: SMTracker | undefined;

  const init = () => new SMTracker();

  return {
    get() {
      if (smTrackerInstance === undefined) smTrackerInstance = init();
      return smTrackerInstance;
    },
  };
})();

export default Tracker;
