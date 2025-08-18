// Copyright (c) 2025 Eclipse Foundation.
// 
// This program and the accompanying materials are made available under the
// terms of the MIT License which is available at
// https://opensource.org/licenses/MIT.
//
// SPDX-License-Identifier: MIT

import connectToDatabase from '../src/lib/mongodb.js';
import Collection from '../src/lib/models/Collection.js';
import Path from '../src/lib/models/Path.js';
import { PATHS } from '../src/lib/mock_data/paths.js';

console.log('🚀 Starting Collections Migration...');

const COLLECTIONS_DATA = [
    {
        name: 'Concepts and Methodology',
        description: 'Concepts, and methodologies shaping software-defined vehicles',
        paths_slugs: ['sdv-guide-sdv101', 'sdv-guide-sdv102', 'pulse-framework'],
        category: 'fundamentals',
        tags: ['concepts', 'methodology', 'sdv'],
        state: 'published'
    },
    {
        name: 'Playground',
        description: 'Do quick prototyping on virtual environments',
        paths_slugs: ['playground-onboarding', 'sdv-runtime-getting-started', 'widget-development'],
        category: 'hands-on',
        tags: ['playground', 'prototyping', 'virtual-environments'],
        state: 'published'
    },
    {
        name: 'dreamKIT',
        description: 'Bring your ideas to life with dreamKIT',
        paths_slugs: ['dreamkit-getting-started', 'dreampack-getting-started'],
        category: 'development',
        tags: ['dreamkit', 'development', 'tools'],
        state: 'published',
        titleTag: "dreamkit"
    }
];

async function migrateCollections() {
    try {
        await connectToDatabase();
        console.log('✅ Connected to database');

        // Clear existing collections
        await Collection.deleteMany({});
        console.log('🗑️  Cleared existing collections');

        // Get all paths from database to map slugs to IDs
        const allPaths = await Path.find({});
        const pathSlugToId = {};
        allPaths.forEach(path => {
            pathSlugToId[path.slug] = path._id;
        });

        console.log(`📚 Found ${allPaths.length} paths in database`);

        const createdCollections = [];

        for (const collectionData of COLLECTIONS_DATA) {
            // Map path slugs to actual path IDs
            const pathIds = [];
            const pathOrder = [];
            
            for (const slug of collectionData.paths_slugs) {
                const pathId = pathSlugToId[slug];
                if (pathId) {
                    pathIds.push(pathId);
                    pathOrder.push(pathId);
                } else {
                    console.log(`⚠️  Warning: Path with slug "${slug}" not found in database`);
                }
            }

            // Generate slug from name
            const slug = collectionData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');

            const collection = new Collection({
                name: collectionData.name,
                slug: slug,
                description: collectionData.description,
                category: collectionData.category,
                tags: collectionData.tags,
                paths: pathIds,
                path_order: pathOrder,
                state: collectionData.state,
                valid_from: new Date(),
                configs: {
                    titleTag: collectionData.titleTag || null
                }
            });

            await collection.save();
            createdCollections.push(collection);
            console.log(`✅ Created collection: ${collection.name} with ${pathIds.length} paths`);
        }

        console.log(`🎉 Successfully migrated ${createdCollections.length} collections`);
        
        // Display summary
        for (const collection of createdCollections) {
            console.log(`  - ${collection.name}: ${collection.paths.length} paths`);
        }

        await connectToDatabase().then(mongoose => mongoose.disconnect());
        console.log('✅ Disconnected from database');

    } catch (error) {
        console.error('❌ Error during collections migration:', error);
        process.exit(1);
    }
}

migrateCollections();
