/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from "react";
import "@testing-library/jest-dom";
import { fullPermissions } from "./__mocks__/permissions";
import { render, screen } from "../../../../test-configs/utils";
import MissingSocialAuthenticatorSelectionModal, {
    MissingSocialAuthenticatorSelectionModalPropsInterface
} from "../missing-social-authenticator-selection-modal";

describe("MissingSocialAuthenticatorSelectionModal", () => {
    const defaultProps: MissingSocialAuthenticatorSelectionModalPropsInterface = {
        authenticatorCategoryDisplayName: "Microsoft",
        authenticatorCategoryTemplate: "microsoft-idp"
    };

    it("renders the MissingSocialAuthenticatorSelectionModal component", () => {
        render(<MissingSocialAuthenticatorSelectionModal { ...defaultProps } />, { allowedScopes: fullPermissions });

        const missingSocialAuthenticatorSelectionModal: Element = screen.getByTestId(
            "missing-social-authenticator-selection-modal"
        );

        expect(missingSocialAuthenticatorSelectionModal).toBeInTheDocument();
    });
});
