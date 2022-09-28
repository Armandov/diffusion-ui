/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect } from "react";

import { useImageCreate, ImageRequest } from "../../../../../stores/imageCreateStore";
import { useImageQueue } from "../../../../../stores/imageQueueStore";
import {
  FetchingStates,
  useImageFetching
} from "../../../../../stores/imageFetchingStore";

import { useImageDisplay } from "../../../../../stores/imageDisplayStore";

import { v4 as uuidv4 } from "uuid";

import { useRandomSeed } from "../../../../../utils";
import { doMakeImage } from "../../../../../api";
import {
  MakeButtonStyle, // @ts-expect-error
} from "./makeButton.css.ts";

import { useTranslation } from "react-i18next";

import AudioDing from "../../../../molecules/audioDing";

export default function MakeButton() {
  const { t } = useTranslation();

  const parallelCount = useImageCreate((state) => state.parallelCount);
  const builtRequest = useImageCreate((state) => state.builtRequest);
  const isRandomSeed = useImageCreate((state) => state.isRandomSeed());
  const setRequestOption = useImageCreate((state) => state.setRequestOptions);

  const addNewImage = useImageQueue((state) => state.addNewImage);
  const hasQueue = useImageQueue((state) => state.hasQueuedImages());
  const removeFirstInQueue = useImageQueue((state) => state.removeFirstInQueue);
  const { id, options } = useImageQueue((state) => state.firstInQueue());

  const status = useImageFetching((state) => state.status);
  const setStatus = useImageFetching((state) => state.setStatus);
  const setStep = useImageFetching((state) => state.setStep);
  const setTotalSteps = useImageFetching((state) => state.setTotalSteps);
  const addProgressImage = useImageFetching((state) => state.addProgressImage);
  const setStartTime = useImageFetching((state) => state.setStartTime);
  const setNowTime = useImageFetching((state) => state.setNowTime);
  const resetForFetching = useImageFetching((state) => state.resetForFetching);
  const appendData = useImageFetching((state) => state.appendData);

  const updateDisplay = useImageDisplay((state) => state.updateDisplay);

  const hackJson = (jsonStr: string) => {

    // DONES't seem to be needed for the updated progress implementation

    // if (jsonStr !== undefined && jsonStr.indexOf('}{') !== -1) {
    //   // hack for a middleman buffering all the streaming updates, and unleashing them
    //   //  on the poor browser in one shot.
    //   //  this results in having to parse JSON like {"step": 1}{"step": 2}...{"status": "succeeded"..}
    //   //  which is obviously invalid.
    //   // So we need to just extract the last {} section, starting from "status" to the end of the response

    //   const lastChunkIdx = jsonStr.lastIndexOf('}{')
    //   if (lastChunkIdx !== -1) {
    //     const remaining = jsonStr.substring(lastChunkIdx)
    //     jsonStr = remaining.substring(1)
    //   }
    // }

    try {

      // todo - used zod or something to validate this
      interface jsonResponseType {
        status: string;
        request: ImageRequest;
        output: []
      }
      const { status, request, output: outputs }: jsonResponseType = JSON.parse(jsonStr);

      if (status === 'succeeded') {
        outputs.forEach((output: any) => {

          const { data, seed } = output;

          const seedReq = {
            ...request,
            seed,
          };

          updateDisplay(data, seedReq);
        });
      }

      else {
        console.warn(`Unexpected status: ${status}`);
      }

    }
    catch (e) {
      console.log("Error HACKING JSON: ", e)
    }
  }

  const parseRequest = async (id: string, reader: ReadableStreamDefaultReader<Uint8Array>) => {
    console.log('parseRequest');
    const decoder = new TextDecoder();
    let finalJSON = '';

    console.log('id', id);
    while (true) {
      const { done, value } = await reader.read();
      const jsonStr = decoder.decode(value);
      if (done) {
        removeFirstInQueue();
        setStatus(FetchingStates.COMPLETE);
        hackJson(finalJSON)
        break;
      }

      try {
        const update = JSON.parse(jsonStr);
        const { status } = update;

        if (status === "progress") {
          setStatus(FetchingStates.PROGRESSING);
          const { progress: { step, total_steps }, output: outputs } = update;
          setStep(step);
          setTotalSteps(total_steps);

          if (step === 0) {
            setStartTime();
          }
          else {
            setNowTime();
          }

          if (void 0 !== outputs) {
            outputs.forEach((output: any) => {
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              const timePath = `${output.path}?t=${new Date().getTime()}`
              addProgressImage(timePath);
            });
          }

        } else if (status === "succeeded") {
          // TODO this should be the the new out instead of the try catch
          // wait for the path to come back instead of the data
          setStatus(FetchingStates.SUCCEEDED);
          console.log(update);
        }
        else if (status === 'failed') {
          console.warn('failed');
          console.log(update);
        }
        else {
          console.log("UNKNOWN ?", update);
        }
      }
      catch (e) {
        console.log('EXPECTED PARSE ERRROR')
        finalJSON += jsonStr;
      }

    }
  }

  const startStream = async (id: string, req: ImageRequest) => {
    // const streamReq = {
    //   ...req,
    //   stream_image_progress: true,
    // };

    try {
      resetForFetching();
      const res = await doMakeImage(req);
      const reader = res.body?.getReader();

      if (void 0 !== reader) {
        void parseRequest(id, reader);
      }

    } catch (e) {
      console.log('TOP LINE STREAM ERROR')
      console.log(e);
    }

  }

  const queueImageRequest = async (req: ImageRequest) => {
    // the actual number of request we will make
    const requests = [];
    // the number of images we will make
    let { num_outputs } = req;
    if (parallelCount > num_outputs) {
      requests.push(num_outputs);
    } else {
      // while we have at least 1 image to make
      while (num_outputs >= 1) {
        // subtract the parallel count from the number of images to make
        num_outputs -= parallelCount;

        // if we are still 0 or greater we can make the full parallel count
        if (num_outputs <= 0) {
          requests.push(parallelCount);
        }
        // otherwise we can only make the remaining images
        else {
          requests.push(Math.abs(num_outputs));
        }
      }
    }

    requests.forEach((num, index) => {
      // get the seed we want to use
      let seed = req.seed;
      if (index !== 0) {
        // we want to use a random seed for subsequent requests
        seed = useRandomSeed();
      }
      // add the request to the queue
      addNewImage(uuidv4(), {
        ...req,
        // updated the number of images to make
        num_outputs: num,
        // update the seed
        seed,
      });
    });
  }

  const makeImageQueue = async () => {
    // potentially update the seed
    if (isRandomSeed) {
      // update the seed for the next time we click the button
      setRequestOption("seed", useRandomSeed());
    }
    // the request that we have built
    const req = builtRequest();
    await queueImageRequest(req);
  };

  useEffect(() => {
    const makeImages = async (options: ImageRequest) => {
      // potentially update the seed
      await startStream(id ?? "", options);
    }

    if (status === FetchingStates.PROGRESSING || status === FetchingStates.FETCHING) {
      return;
    }

    if (hasQueue) {

      if (options === undefined) {
        console.log('req is undefined');
        return;
      }
      makeImages(options).catch((e) => {
        console.log('HAS QUEUE ERROR');
        console.log(e);
      });
    }

  }, [hasQueue, status, id, options, startStream]);

  return (
    <button
      className={MakeButtonStyle}
      onClick={() => {
        void makeImageQueue();
      }}
      disabled={hasQueue}
    >
      {t("home.make-img-btn")}
    </button>
  );
}