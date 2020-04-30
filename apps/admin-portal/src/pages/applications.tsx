/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

import { hasRequiredScopes } from "@wso2is/core/helpers";
import { AlertLevels } from "@wso2is/core/models";
import { addAlert } from "@wso2is/core/store";
import { EmptyPlaceholder, LinkButton, PrimaryButton } from "@wso2is/react-components";
import _ from "lodash";
import React, {
    FunctionComponent,
    MouseEvent,
    ReactElement,
    SyntheticEvent,
    useEffect,
    useState
} from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { DropdownItemProps, DropdownProps, Icon, PaginationProps } from "semantic-ui-react";
import { getApplicationList } from "../api";
import { AdvancedSearchWithBasicFilters, ApplicationList } from "../components";
import { EmptyPlaceholderIllustrations } from "../configs";
import { ApplicationConstants } from "../constants";
import { history } from "../helpers";
import { ListLayout, PageLayout } from "../layouts";
import { ApplicationListInterface, FeatureConfigInterface } from "../models";
import { AppState } from "../store";

const APPLICATIONS_LIST_SORTING_OPTIONS: DropdownItemProps[] = [
    {
        key: 1,
        text: "Name",
        value: "name"
    },
    {
        key: 2,
        text: "Type",
        value: "type"
    },
    {
        key: 3,
        text: "Created date",
        value: "createdDate"
    },
    {
        key: 4,
        text: "Last updated",
        value: "lastUpdated"
    }
];

// TODO: Calculate based on the screen dimensions.
const DEFAULT_APP_LIST_ITEM_LIMIT = 10;

/**
 * Overview page.
 *
 * @return {React.ReactElement}
 */
export const ApplicationsPage: FunctionComponent<{}> = (): ReactElement => {

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const featureConfig: FeatureConfigInterface = useSelector((state: AppState) => state.config.features);

    const [ searchQuery, setSearchQuery ] = useState("");
    const [ listSortingStrategy, setListSortingStrategy ] = useState<DropdownItemProps>(
        APPLICATIONS_LIST_SORTING_OPTIONS[ 0 ]
    );
    const [ appList, setAppList ] = useState<ApplicationListInterface>({});
    const [ listOffset, setListOffset ] = useState<number>(0);
    const [ listItemLimit, setListItemLimit ] = useState<number>(DEFAULT_APP_LIST_ITEM_LIMIT);
    const [ isApplicationListRequestLoading, setApplicationListRequestLoading ] = useState<boolean>(false);

    /**
     * Called on every `listOffset` & `listItemLimit` change.
     */
    useEffect(() => {
        getAppLists(listItemLimit, listOffset, null);
    }, [ listOffset, listItemLimit ]);

    /**
     * Retrieves the list of applications.
     *
     * @param {number} limit - List limit.
     * @param {number} offset - List offset.
     * @param {string} filter - Search query.
     */
    const getAppLists = (limit: number, offset: number, filter: string): void => {
        setApplicationListRequestLoading(true);

        getApplicationList(limit, offset, filter)
            .then((response) => {
                setAppList(response);
            })
            .catch((error) => {
                if (error.response && error.response.data && error.response.data.description) {
                    dispatch(addAlert({
                        description: error.response.data.description,
                        level: AlertLevels.ERROR,
                        message: "Application Create Error"
                    }));

                    return;
                }

                dispatch(addAlert({
                    description: "An error occurred while retrieving applications",
                    level: AlertLevels.ERROR,
                    message: "Retrieval Error"
                }));
            })
            .finally(() => {
                setApplicationListRequestLoading(false);
            });
    };

    /**
     * Sets the list sorting strategy.
     *
     * @param {React.SyntheticEvent<HTMLElement>} event - The event.
     * @param {DropdownProps} data - Dropdown data.
     */
    const handleListSortingStrategyOnChange = (event: SyntheticEvent<HTMLElement>,
                                               data: DropdownProps): void => {
        setListSortingStrategy(_.find(APPLICATIONS_LIST_SORTING_OPTIONS, (option) => {
            return data.value === option.value;
        }));
    };

    /**
     * Handles the `onFilter` callback action from the
     * application search component.
     *
     * @param {string} query - Search query.
     */
    const handleApplicationFilter = (query: string): void => {
        setSearchQuery(query);
        getAppLists(listItemLimit, listOffset, query);
    };

    /**
     * Handles the pagination change.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event - Mouse event.
     * @param {PaginationProps} data - Pagination component data.
     */
    const handlePaginationChange = (event: MouseEvent<HTMLAnchorElement>, data: PaginationProps): void => {
        setListOffset((data.activePage as number - 1) * listItemLimit);
    };

    /**
     * Handles per page dropdown page.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event - Mouse event.
     * @param {DropdownProps} data - Dropdown data.
     */
    const handleItemsPerPageDropdownChange = (event: MouseEvent<HTMLAnchorElement>,
                                              data: DropdownProps): void => {
        setListItemLimit(data.value as number);
    };

    /**
     * Handles application delete action.
     */
    const handleApplicationDelete = (): void => {
        getAppLists(listItemLimit, listOffset, null);
    };

    /**
     * Handles the `onSearchQueryClear` callback action.
     */
    const handleSearchQueryClear = (): void => {
        setSearchQuery("");
        getAppLists(listItemLimit, listOffset, null);
    };

    /**
     * Resolve the relevant placeholder.
     *
     * @return {React.ReactElement}
     */
    const showPlaceholders = (): ReactElement => {
        // When the search returns empty.
        if (searchQuery) {
            return (
                <EmptyPlaceholder
                    action={ (
                        <LinkButton onClick={ handleSearchQueryClear }>Clear search query</LinkButton>
                    ) }
                    image={ EmptyPlaceholderIllustrations.emptySearch }
                    imageSize="tiny"
                    title={ "No results found" }
                    subtitle={ [
                        `We couldn't find any results for ${ searchQuery }`,
                        "Please try a different search term."
                    ] }
                />
            );
        }

        return (
            <EmptyPlaceholder
                action={ (
                    <PrimaryButton
                        onClick={ (): void => {
                            history.push(ApplicationConstants.PATHS.get("APPLICATION_TEMPLATES"));
                        } }
                    >
                        <Icon name="add"/>New Application
                    </PrimaryButton>
                ) }
                image={ EmptyPlaceholderIllustrations.newList }
                imageSize="tiny"
                title={ "Create an Application" }
                subtitle={ [
                    "There are currently no applications available.",
                    "You can create a new application easily by using the",
                    "predefined templates."
                ] }
            />
        );
    };

    return (
        <PageLayout
            title="Applications"
            description="Create and manage applications based on templates and configure authentication."
            showBottomDivider={ true }
        >
            <ListLayout
                advancedSearch={
                    <AdvancedSearchWithBasicFilters
                        onFilter={ handleApplicationFilter }
                        filterAttributeOptions={ [
                            {
                                key: 0,
                                text: t("common:name"),
                                value: "name"
                            }
                        ] }
                        filterAttributePlaceholder={
                            t("devPortal:components.applications.advancedSearch.form.inputs.filterAttribute" +
                                ".placeholder")
                        }
                        filterConditionsPlaceholder={
                            t("devPortal:components.applications.advancedSearch.form.inputs.filterCondition" +
                                ".placeholder")
                        }
                        filterValuePlaceholder={
                            t("devPortal:components.applications.advancedSearch.form.inputs.filterValue" +
                                ".placeholder")
                        }
                        placeholder={ t("devPortal:components.applications.advancedSearch.placeholder") }
                        defaultSearchAttribute="name"
                        defaultSearchOperator="co"
                    />
                }
                currentListSize={ appList.count }
                listItemLimit={ listItemLimit }
                onItemsPerPageDropdownChange={ handleItemsPerPageDropdownChange }
                onPageChange={ handlePaginationChange }
                onSortStrategyChange={ handleListSortingStrategyOnChange }
                rightActionPanel={
                    (hasRequiredScopes(featureConfig?.applications, featureConfig?.applications?.scopes?.create))
                        ? (
                            <PrimaryButton
                                onClick={ (): void => {
                                    history.push(ApplicationConstants.PATHS.get("APPLICATION_TEMPLATES"));
                                } }
                            >
                                <Icon name="add"/>New Application
                            </PrimaryButton>
                        )
                        : null
                }
                showPagination={ true }
                showTopActionPanel={ !(!searchQuery && appList?.totalResults <= 0) }
                sortOptions={ APPLICATIONS_LIST_SORTING_OPTIONS }
                sortStrategy={ listSortingStrategy }
                totalPages={ Math.ceil(appList.totalResults / listItemLimit) }
                totalListSize={ appList.totalResults }
            >
                {
                    (appList?.totalResults > 0 ||
                        appList?.applications instanceof Array && appList.applications.length > 0)
                        ? (
                            <ApplicationList
                                featureConfig={ featureConfig }
                                list={ appList }
                                onApplicationDelete={ handleApplicationDelete }
                            />
                        )
                        : !isApplicationListRequestLoading && showPlaceholders()
                }
            </ListLayout>
        </PageLayout>
    );
};
