import {Chain, ChainContinueReport, ChainErrorReport, ChainReport, ChainStopReport, Step} from "./types";

type ApplyFunction<ChainInput, ChainContinueOutput, ChainStopOutput, ChainError> = (value: ChainInput) => ChainReport<ChainContinueOutput, ChainStopOutput, ChainError>;

/**
 * Creates continue chain report from provided value
 * @param value
 */
const continueWith = <T>(value: T): ChainContinueReport<T> => ({ok: true, stop: false, value});

/**
 * Crates stop chain report from provided value
 * @param value
 */
const stopWith = <T>(value: T): ChainStopReport<T> => ({ok: true, stop: true, value});

/**
 * Creates error chain report from provided error
 */
const errorWith = <T = undefined>(error: T): ChainErrorReport<T> => ({ok: false, error});


/**
 * Appends step to chain
 * Returns new immutable chain
 * @param prevApply - apply function of chain to extend
 * @param step - new step
 * @param error - optional step error
 */
function continueChain<ChainInput, ChainContinueOutput, ChainStopOutput, ChainError, StepContinueOutput, StepStopOutput, StepError>(
    prevApply: ApplyFunction<ChainInput, ChainContinueOutput, ChainStopOutput, ChainError>,
    step: Step<ChainContinueOutput, StepContinueOutput, StepStopOutput>,
    error?: StepError
): Chain<ChainInput, StepContinueOutput, ChainStopOutput | StepStopOutput, ChainError | StepError> {

    const apply = (value: ChainInput): ChainReport<StepContinueOutput, ChainStopOutput | StepStopOutput, ChainError | StepError> => {

        const prevReport = prevApply(value);

        if (!prevReport.ok) {
            return prevReport;
        }

        if (prevReport.stop) {
            return prevReport
        }

        const stepInput = prevReport.value;
        const stepReport = step(stepInput);

        if (!stepReport.ok) {
            return errorWith(error as any); // TODO: Fix this
        }

        if (stepReport.stop) {
            return stopWith(stepReport.value);
        }

        return continueWith(stepReport.value);
    };

    const then = <NextStepContinueOutput, NextStepStopOutput, NextStepError>(step: Step<StepContinueOutput, NextStepContinueOutput, NextStepStopOutput>, error?: NextStepError): Chain<ChainInput, NextStepContinueOutput, ChainStopOutput | StepStopOutput | NextStepStopOutput, ChainError | StepError | NextStepError> => {
        return continueChain(apply, step, error);
    };

    return Object.freeze({
        apply,
        then,
    });
}


/**
 * Creates new immutable chain
 */
export function treat() {
    return Object.freeze({
        then<ChainInput, ChainContinueOutput, ChainStopOutput = never, ChainError = never>(step: Step<ChainInput, ChainContinueOutput, ChainStopOutput>, error?: ChainError): Chain<ChainInput, ChainContinueOutput, ChainStopOutput, ChainError> {
            return continueChain(continueWith, step, error);
        }
    });
}

