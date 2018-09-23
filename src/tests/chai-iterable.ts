import * as chai from "chai";
import * as mocha from "mocha";

declare global {
    module Chai {
        interface ChaiStatic {
            Assertion: AssertionStatic;
        }
        interface AssertionStatic {
            new (target: any, message?: string): Assertion;
            addMethod(name: string, fn: Function): void;
        }
        interface UtilsStatic {
            flag(obj: any, key: string): any;
            flag(obj: any, key: string, value: any): void;
        }
        interface Assertion {
            equalSequence(exp: Iterable<any>, msg?: string): Assertion;
            equalSequenceAsync(exp: Iterable<any> | AsyncIterable<any>, msg?: string): Promise<void>;
            startWithSequence(exp: Iterable<any>, msg?: string): Assertion;
            startWithSequenceAsync(exp: Iterable<any> | AsyncIterable<any>, msg?: string): Promise<void>;
        }
        interface AssertStatic {
            sequenceEqual<T>(act: Iterable<T>, exp: Iterable<T>, msg?: string): void;
            sequenceEqualAsync<T>(act: AsyncIterable<T>, exp: Iterable<T> | AsyncIterable<T>, msg?: string): void;
            sequenceStartsWith<T>(act: Iterable<T>, exp: Iterable<T>, msg?: string): void;
            sequenceStartsWithAsync<T>(act: AsyncIterable<T>, exp: Iterable<T> | AsyncIterable<T>, msg?: string): void;
        }
    }
}

chai.use((chai: Chai.ChaiStatic, utils: Chai.UtilsStatic) => {
    chai.Assertion.addMethod("equalSequence", equalSequence);
    chai.Assertion.addMethod("equalSequenceAsync", equalSequenceAsync);
    chai.Assertion.addMethod("startWithSequence", startWithSequence);
    chai.Assertion.addMethod("startWithSequenceAsync", startWithSequenceAsync);

    chai.assert.sequenceEqual = function <T>(act: Iterable<T>, exp: Iterable<T>, msg?: string): void {
        chai.expect(act).to.equalSequence(exp, msg);
    };

    chai.assert.sequenceEqualAsync = function <T>(act: AsyncIterable<T>, exp: Iterable<T> | AsyncIterable<T>, msg?: string): Promise<void> {
        return chai.expect(act).to.equalSequenceAsync(exp, msg);
    };

    chai.assert.sequenceStartsWith = function <T>(act: Iterable<T>, exp: Iterable<T>, msg?: string): void {
        chai.expect(act).to.startWithSequence(exp, msg);
    };

    chai.assert.sequenceStartsWithAsync = function <T>(act: AsyncIterable<T>, exp: Iterable<T> | AsyncIterable<T>, msg?: string): Promise<void> {
        return chai.expect(act).to.startWithSequenceAsync(exp, msg);
    };

    class Sequence {
        private leadingValues: any[];
        private hasMore: boolean;

        constructor(leadingValues: any[], hasMore: boolean) {
            this.leadingValues = leadingValues;
            this.hasMore = hasMore;
        }

        inspect() {
            return "[" + this.leadingValues.join(", ") + (this.hasMore ? ", ...]" : "]");
        }

        stringify() {
            let values: string[] = [];
            for (const value of this.leadingValues) {
                const json = JSON.stringify(value, undefined, "  ") || "undefined";
                const lines = json.split(/\r\n?|\n/g);
                values.push(lines.map(line => "  " + line).join("\n"));
            }

            if (this.hasMore) {
                values.push("  ...");
            }

            return values.length > 0 ? "[\n" + values.join("\n") + "\n]" : "[]";
        }
    }

    const savedStringify = (<any>mocha).utils.stringify;
    (<any>mocha).utils.stringify = function (value: any) {
        if (value instanceof Sequence) {
            return value.stringify();
        }

        return savedStringify.apply(this, arguments);
    }

    function equalSequence(expected: Iterable<any>, msg?: string): Chai.Assertion {
        if (msg) utils.flag(this, "message", msg);
        const actual = utils.flag(this, "object") as Iterable<any>;
        const actualValues: any[] = [];
        const expectedValues: any[] = [];
        let hasMoreActualValues = true;
        let hasMoreExpectedValues = true;
        let sequencesAreEqual: boolean;
        let actualIterator = actual[Symbol.iterator]();
        try {
            let expectedIterator = expected[Symbol.iterator]();
            try {
                while (true) {
                    const actualResult = actualIterator.next()
                        , actualDone = actualResult.done
                        , actualValue = actualResult.value;
                    const expectedResult = expectedIterator.next()
                        , expectedDone = expectedResult.done
                        , expectedValue = expectedResult.value;

                    if (actualDone) {
                        actualIterator = undefined;
                        hasMoreActualValues = false;
                    }
                    else {
                        actualValues.push(actualValue);
                    }

                    if (expectedDone) {
                        expectedIterator = undefined;
                        hasMoreExpectedValues = false;
                    }
                    else {
                        expectedValues.push(expectedValue);
                    }

                    if (Boolean(actualDone) !== Boolean(expectedDone) || actualValue !== expectedValue) {
                        sequencesAreEqual = false;
                        if (!actualDone) {
                            if (actualIterator.next().done) {
                                hasMoreActualValues = false;
                            }
                        }
                        if (!expectedDone) {
                            if (expectedIterator.next().done) {
                                hasMoreExpectedValues = false;
                            }
                        }
                        break;
                    }

                    if (actualDone && expectedDone) {
                        sequencesAreEqual = true;
                        break;
                    }
                }
            }
            finally {
                IteratorClose(expectedIterator);
            }
        }
        finally {
            IteratorClose(actualIterator);
        }

        this.assert(
            sequencesAreEqual,
            "expected #{act} to equal #{exp}",
            "expected #{act} to not equal #{exp}",
            new Sequence(expectedValues, hasMoreExpectedValues),
            new Sequence(actualValues, hasMoreActualValues),
            true
        );

        return this;
    }

    async function equalSequenceAsync(expected: Iterable<any> | AsyncIterable<any>, msg?: string): Promise<void> {
        if (msg) utils.flag(this, "message", msg);
        const actual = utils.flag(this, "object") as Iterable<any> | AsyncIterable<any>;
        const actualValues: any[] = [];
        const expectedValues: any[] = [];
        let hasMoreActualValues = true;
        let hasMoreExpectedValues = true;
        let sequencesAreEqual: boolean;
        let actualIterator = isAsyncIterable(actual) ? actual[Symbol.asyncIterator]() : actual[Symbol.iterator]();
        try {
            let expectedIterator = isAsyncIterable(expected) ? expected[Symbol.asyncIterator]() : expected[Symbol.iterator]();
            try {
                while (true) {
                    const actualResult = await actualIterator.next()
                        , actualDone = actualResult.done
                        , actualValue = actualResult.value;
                    const expectedResult = await expectedIterator.next()
                        , expectedDone = expectedResult.done
                        , expectedValue = expectedResult.value;

                    if (actualDone) {
                        actualIterator = undefined;
                        hasMoreActualValues = false;
                    }
                    else {
                        actualValues.push(actualValue);
                    }

                    if (expectedDone) {
                        expectedIterator = undefined;
                        hasMoreExpectedValues = false;
                    }
                    else {
                        expectedValues.push(expectedValue);
                    }

                    if (Boolean(actualDone) !== Boolean(expectedDone) || actualValue !== expectedValue) {
                        sequencesAreEqual = false;
                        if (!actualDone) {
                            if ((await actualIterator.next()).done) {
                                hasMoreActualValues = false;
                            }
                        }
                        if (!expectedDone) {
                            if ((await expectedIterator.next()).done) {
                                hasMoreExpectedValues = false;
                            }
                        }
                        break;
                    }

                    if (actualDone && expectedDone) {
                        sequencesAreEqual = true;
                        break;
                    }
                }
            }
            finally {
                await AsyncIteratorClose(expectedIterator);
            }
        }
        finally {
            await AsyncIteratorClose(actualIterator);
        }

        this.assert(
            sequencesAreEqual,
            "expected #{act} to equal #{exp}",
            "expected #{act} to not equal #{exp}",
            new Sequence(expectedValues, hasMoreExpectedValues),
            new Sequence(actualValues, hasMoreActualValues),
            true
        );
    }

    function startWithSequence(expected: Iterable<any>, msg?: string): Chai.Assertion {
        if (msg) utils.flag(this, "message", msg);
        const actual = utils.flag(this, "object") as Iterable<any>;
        const actualValues: any[] = [];
        const expectedValues: any[] = [];
        let startsWithSequence: boolean;
        let hasMoreActualValues = true;
        let hasMoreExpectedValues = true;
        let actualIterator = actual[Symbol.iterator]();
        try {
            let expectedIterator = expected[Symbol.iterator]();
            try {
                while (true) {
                    const actualResult = actualIterator.next()
                        , actualDone = actualResult.done
                        , actualValue = actualResult.value;
                    const expectedResult = expectedIterator.next()
                        , expectedDone = expectedResult.done
                        , expectedValue = expectedResult.value;

                    if (actualDone) {
                        actualIterator = undefined;
                        hasMoreActualValues = false;
                    }
                    else {
                        actualValues.push(actualValue);
                    }

                    if (expectedDone) {
                        expectedIterator = undefined;
                        hasMoreExpectedValues = false;
                    }
                    else {
                        expectedValues.push(expectedValue);
                    }

                    if (expectedDone) {
                        startsWithSequence = true;
                        break;
                    }

                    if (actualDone || actualValue !== expectedValue) {
                        startsWithSequence = false;
                        break;
                    }
                }
            }
            finally {
                IteratorClose(expectedIterator);
            }
        }
        finally {
            IteratorClose(actualIterator);
        }

        //utils.flag(this, "object", actualValues);
        this.assert(
            startsWithSequence,
            "expected #{act} to start with #{exp}",
            "expected #{act} to not start with #{exp}",
            new Sequence(expectedValues, hasMoreExpectedValues),
            new Sequence(actualValues, hasMoreActualValues),
            true
        );

        //utils.flag(this, "object", actual);
        return this;
    }

    async function startWithSequenceAsync(expected: Iterable<any> | AsyncIterable<any>, msg?: string): Promise<void> {
        if (msg) utils.flag(this, "message", msg);
        const actual = utils.flag(this, "object") as Iterable<any> | AsyncIterable<any>;
        const actualValues: any[] = [];
        const expectedValues: any[] = [];
        let startsWithSequence: boolean;
        let hasMoreActualValues = true;
        let hasMoreExpectedValues = true;
        let actualIterator = isAsyncIterable(actual) ? actual[Symbol.asyncIterator]() : actual[Symbol.iterator]();
        try {
            let expectedIterator = isAsyncIterable(expected) ? expected[Symbol.asyncIterator]() : expected[Symbol.iterator]();
            try {
                while (true) {
                    const actualResult = await actualIterator.next()
                        , actualDone = actualResult.done
                        , actualValue = actualResult.value;
                    const expectedResult = await expectedIterator.next()
                        , expectedDone = expectedResult.done
                        , expectedValue = expectedResult.value;

                    if (actualDone) {
                        actualIterator = undefined;
                        hasMoreActualValues = false;
                    }
                    else {
                        actualValues.push(actualValue);
                    }

                    if (expectedDone) {
                        expectedIterator = undefined;
                        hasMoreExpectedValues = false;
                    }
                    else {
                        expectedValues.push(expectedValue);
                    }

                    if (expectedDone) {
                        startsWithSequence = true;
                        break;
                    }

                    if (actualDone || actualValue !== expectedValue) {
                        startsWithSequence = false;
                        break;
                    }
                }
            }
            finally {
                await AsyncIteratorClose(expectedIterator);
            }
        }
        finally {
            await AsyncIteratorClose(actualIterator);
        }

        this.assert(
            startsWithSequence,
            "expected #{act} to start with #{exp}",
            "expected #{act} to not start with #{exp}",
            new Sequence(expectedValues, hasMoreExpectedValues),
            new Sequence(actualValues, hasMoreActualValues),
            true
        );
    }
});

function isAsyncIterable(obj: any): obj is AsyncIterable<any> {
    return Symbol.asyncIterator in obj;
}

function IteratorClose<T>(iterator: Iterator<T>): IteratorResult<T> {
    if (iterator !== undefined) {
        const close = iterator.return;
        if (typeof close === "function") {
            return close.call(iterator);
        }
    }
}

async function AsyncIteratorClose<T>(iterator: AsyncIterator<T> | Iterator<T>): Promise<IteratorResult<T>> {
    if (iterator !== undefined) {
        const close = iterator.return;
        if (typeof close === "function") {
            return await close.call(iterator);
        }
    }
}