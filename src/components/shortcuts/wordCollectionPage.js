import wordCollectionPage from "cmp/wordCollectionPage.vue";

import {mount} from "@vue/test-utils";

export default () => {
    mount(wordCollectionPage, {
        attachTo: "#test"
    });
};
