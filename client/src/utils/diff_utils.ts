import { I_Product_Data } from '../types/interfaces';

export type DiffResult = {
    hasChanges: boolean;
    needsSEO: boolean;
    needsFront: boolean;
    needsBack: boolean;
    needsVideo: boolean;
};

export const F_Analyze_Config_Diff = (oldProduct: I_Product_Data, newConfig: Partial<I_Product_Data>): DiffResult => {
    const changes: DiffResult = {
        hasChanges: false,
        needsSEO: false,
        needsFront: false,
        needsBack: false,
        needsVideo: false
    };

    // 1. Critical Changes (Affects EVERYTHING)
    // Gender, Age, Body Type (fit), Clothing Cut (productFit), Description
    if (
        (newConfig.gender !== undefined && newConfig.gender !== oldProduct.gender) ||
        (newConfig.age && newConfig.age !== oldProduct.age) ||
        (newConfig.vücut_tipi && newConfig.vücut_tipi !== oldProduct.vücut_tipi) ||
        (newConfig.kesim && newConfig.kesim !== oldProduct.kesim) ||
        (newConfig.raw_desc && newConfig.raw_desc !== oldProduct.raw_desc)
    ) {
        changes.hasChanges = true;
        changes.needsSEO = true;
        changes.needsFront = true;
        changes.needsBack = true;
        changes.needsVideo = true;
        return changes; // Early exit as everything triggers
    }

    // 2. Visual-Only Changes (Skip SEO)
    // Background, Accessory
    if (
        (newConfig.background && newConfig.background !== oldProduct.background) ||
        (newConfig.aksesuar && newConfig.aksesuar !== oldProduct.aksesuar)
    ) {
        changes.hasChanges = true;
        changes.needsFront = true;
        changes.needsBack = true;
        changes.needsVideo = true;
        // SEO is preserved
    }

    return changes;
};
