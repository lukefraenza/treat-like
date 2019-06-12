import {Chain, ChainContinueReport, ChainErrorReport, ChainReport, ChainStopReport, Step} from "./types";

type ApplyFunction<ChainInput, ChainContinueOutput, ChainStopOutput, ChainError> = (value: ChainInput) => ChainReport<ChainContinueOutput, ChainStopOutput, ChainError>;

/**
 * Creates continue chain report from provided value
 * @param value
 */
export const continueReport = <T>(value: T): ChainContinueReport<T> =>
    Object.freeze({ok: true, stop: false, value});

/**
 * Crates stop chain report from provided value
 * @param value
 */
export const stopReport = <T>(value: T): ChainStopReport<T> =>
    Object.freeze({ok: true, stop: true, value});

/**
 * Creates error chain report from provided error
 */
export const errorReport = <T = undefined>(error?: T): ChainErrorReport<T> =>
    Object.freeze({ok: false, error});


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

        try {
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
                return errorReport(error as any); // TODO: Fix this
            }

            if (stepReport.stop) {
                return stopReport(stepReport.value);
            }

            return continueReport(stepReport.value);

        } catch (e) {
            return errorReport(error);
        }
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
            return continueChain(continueReport, step, error);
        }
    });
}

