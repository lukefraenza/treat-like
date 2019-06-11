import {Chain, ChainReport, Step} from "./types";

function continueChain<ChainInput, ChainContinueOutput, ChainStopOutput, ChainError, StepContinueOutput, StepStopOutput, StepError>(step: Step<ChainContinueOutput, StepContinueOutput, StepStopOutput>, error?: StepError): Chain<ChainInput, StepContinueOutput, ChainStopOutput | StepStopOutput, ChainError | StepError> {
    return Object.freeze({
        apply(value: ChainInput): ChainReport<StepContinueOutput, ChainStopOutput | StepStopOutput, ChainError | StepError> {
            throw new Error("Not Implemented");
        },

        then<NextStepContinueOutput, NextStepStopOutput, NextStepError>(step: Step<StepContinueOutput, NextStepContinueOutput, NextStepStopOutput>, error?: NextStepError): Chain<ChainInput, NextStepContinueOutput, ChainStopOutput | NextStepStopOutput, ChainError | NextStepError> {
            return continueChain(step, error);
        },
    });
}

/**
 * Creates new chain
 */
export function treat() {
    return Object.freeze({
        then<ChainInput, ChainContinueOutput, ChainStopOutput = never, ChainError = never>(step: Step<ChainInput, ChainContinueOutput, ChainStopOutput>, error?: ChainError): Chain<ChainInput, ChainContinueOutput, ChainStopOutput, ChainError> {
            return continueChain(step, error);
        }
    });
}

