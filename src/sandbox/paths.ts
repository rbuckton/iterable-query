/*!
  Copyright 2018 Ron Buckton (rbuckton@chronicles.org)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */

export class Pattern {
    prefix: string;
    suffix: string;

    constructor(prefix: string, suffix: string) {
        this.prefix = prefix;
        this.suffix = suffix;
    }

    static parse(pattern: string) {
        const starIndex = pattern.indexOf("*");
        if (starIndex === -1) return pattern;
        const prefix = pattern.slice(0, starIndex);
        const suffix = pattern.slice(starIndex + 1);
        return new Pattern(prefix, suffix);
    }

    exec(input: string) {
        if (input.length >= this.prefix.length + this.suffix.length &&
            input.startsWith(this.prefix) &&
            input.endsWith(this.suffix)) {
            return input.slice(this.prefix.length, input.length - this.suffix.length);
        }
        return null;
    }

    apply(value: string) {
        return this.prefix + value + this.suffix;
    }

    toString() {
        return `${this.prefix}*${this.suffix}`;
    }
}