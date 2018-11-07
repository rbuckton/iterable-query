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
/** @module "iterable-query" */

export class Lazy<T> {
    private _value!: T;
    private _factory: ((...args: any) => T) | undefined;
    private _args: any[] | undefined;

    private constructor() {
        this._value = undefined!;
        this._factory = undefined;
        this._args = undefined;
    }

    static from<T, A extends any[]>(factory: (...args: A) => T, ...args: A) {
        const lazy = new Lazy<T>();
        lazy._factory = factory;
        lazy._args = args;
        return lazy;
    }

    static for<T>(value: T) {
        const lazy = new Lazy<T>();
        lazy._value = value;
        return lazy;
    }

    get hasValue() {
        return this._factory === undefined;
    }

    get value() {
        const factory = this._factory;
        const args = this._args;
        if (factory) {
            let ok = false;
            try {
                this._factory = resolvingValueFactory;
                this._args = undefined;
                this._value = args ? factory(...args) : factory();
                ok = true;
            }
            finally {
                if (ok) {
                    this._factory = undefined;
                }
                else {
                    this._factory = factory;
                    this._args = args;
                }
            }
        }
        return this._value;
    }
}

function resolvingValueFactory(): never {
    throw new Error("'value' recursively references itself during its own initialization.");
}