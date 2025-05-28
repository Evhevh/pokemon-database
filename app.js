// ########################################
// ########## SETUP

// Citation for the following code:
// Date: 5/6/2025
// Copied/Adapted/Based on:
// Source URL: https://canvas.oregonstate.edu/courses/1999601/pages/exploration-web-application-technology-2?module_item_id=25352948


// Express
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const PORT = 6742;

// Database
const db = require('./database/db-connector');

// Handlebars
const { engine } = require('express-handlebars');
app.engine('.hbs', engine({
    extname: '.hbs',
    helpers: {
        length: arr => (Array.isArray(arr) ? arr.length : 0),
        eq: (a, b) => a === b
    }
}));
app.set('view engine', '.hbs');

// ########################################
// ########## ROUTE HANDLERS

// READ ROUTES
app.get('/', async function (req, res) {
    try {
        res.render('home'); // Render the home.hbs file
    } catch (error) {
        console.error('Error rendering page:', error);
        // Send a generic error message to the browser
        res.status(500).send('An error occurred while rendering the page.');
    }
});

app.get('/parties', async function (req, res) {
    try {
        // Create and execute our query
        const query = `SELECT parties.parties_id 
                        FROM parties 
                        ORDER BY parties_id;`;
        const [parties] = await db.query(query);

        // Render the parties.hbs file, and send the query result
        res.render('parties', { parties: parties });
    } catch (error) {
        console.error('Error executing query:', error);
        // Send a generic error message to the browser
        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

app.get('/customized-parties', async function (req, res) {
    try {
        const query = `SELECT parties_has_customized_pokemon.parties_id, 
                        customized_pokemon.customized_pokemon_id, 
                        pokemon.name AS 'pokemon_name' 
                        FROM parties_has_customized_pokemon
                        LEFT JOIN customized_pokemon ON parties_has_customized_pokemon.customized_pokemon_id = customized_pokemon.customized_pokemon_id
                        LEFT JOIN pokemon on customized_pokemon.pokemon_id = pokemon.pokemon_id`;
        const query2 = `SELECT customized_pokemon_id, 
                        pokemon.name AS 'pokemon_name'
                        FROM customized_pokemon
                        LEFT JOIN pokemon ON customized_pokemon.pokemon_id = pokemon.pokemon_id
                        ORDER BY customized_pokemon.customized_pokemon_id`;
        const query3 = `SELECT parties_id FROM parties ORDER BY parties_id;`;

        const [customized_parties] = await db.query(query);
        const [customized_pokemon] = await db.query(query2);
        const [all_parties] = await db.query(query3);

        res.render('customized-parties', { 
            customized_parties: customized_parties, 
            customized_pokemon: customized_pokemon,
            all_parties: all_parties // <-- Add this line
        });
    } catch (error) {
        console.error('Error executing query:', error);

        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

app.get('/customized-pokemon', async function (req, res) {
    try {
        const query = `SELECT customized_pokemon.customized_pokemon_id,
                        pokemon.name AS 'pokemon_name',
                        abilities.name AS 'ability_name',
                        natures.name AS 'nature_name',
                        items.name AS 'item_name'
                        FROM customized_pokemon
                        LEFT JOIN pokemon on customized_pokemon.pokemon_id = pokemon.pokemon_id
                        LEFT JOIN abilities on customized_pokemon.abilities_id = abilities.abilities_id
                        LEFT JOIN natures on customized_pokemon.natures_id = natures.natures_id
                        LEFT JOIN items on customized_pokemon.items_id = items.items_id`;
        const query2 = 'SELECT pokemon_id, name FROM pokemon;';
        const query3 ='SELECT * FROM abilities;';
        const query4 ='SELECT * FROM natures;';
        const query5 ='SELECT * FROM items;';
        const query6 = `
            SELECT DISTINCT cp.customized_pokemon_id, p.name AS pokemon_name
            FROM customized_pokemon cp
            JOIN parties_has_customized_pokemon phcp ON cp.customized_pokemon_id = phcp.customized_pokemon_id
            JOIN pokemon p ON cp.pokemon_id = p.pokemon_id
            ORDER BY cp.customized_pokemon_id
        `;
        const [customized_pokemon] = await db.query(query);
        const [pokemon] = await db.query(query2)
        const [ability] = await db.query(query3)
        const [nature] = await db.query(query4)
        const [item] = await db.query(query5)
        const [update_pokemon] = await db.query(query6)
        const [parties] = await db.query('SELECT parties_id FROM parties;');

        res.render('customized-pokemon', {
            customized_pokemon: customized_pokemon,
            pokemon: pokemon,
            ability: ability,
            nature: nature,
            item:item,
            update_pokemon: update_pokemon,
            parties: parties,
        });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('An error occurred while executing the database query.');
    }
});

app.get('/customized-pokemon-moves', async function (req, res) {
    try {
        const query = `
            SELECT cp.customized_pokemon_id,
                   p.name AS pokemon_name,
                   m.moves_id,
                   m.name AS move_name
            FROM customized_pokemon cp
            LEFT JOIN pokemon p ON cp.pokemon_id = p.pokemon_id
            LEFT JOIN customized_pokemon_has_moves cphm ON cp.customized_pokemon_id = cphm.customized_pokemon_id
            LEFT JOIN moves m ON cphm.moves_id = m.moves_id
            ORDER BY cp.customized_pokemon_id, m.name
        `;
        const [rows] = await db.query(query);

        // Group moves by customized_pokemon_id
        const grouped = [];
        const map = new Map();
        for (const row of rows) {
            if (!map.has(row.customized_pokemon_id)) {
                map.set(row.customized_pokemon_id, {
                    customized_pokemon_id: row.customized_pokemon_id,
                    pokemon_name: row.pokemon_name,
                    moves: []
                });
                grouped.push(map.get(row.customized_pokemon_id));
            }
            if (row.moves_id && row.move_name) {
                map.get(row.customized_pokemon_id).moves.push({
                    moves_id: row.moves_id,
                    move_name: row.move_name
                });
            }
        }

        const [allMoves] = await db.query('SELECT moves_id, name FROM moves ORDER BY name;');

        res.render('customized-pokemon-moves', {
            customized_pokemon_moves: grouped,
            all_moves: allMoves
        });
    } catch (error) {
        console.error('Error executing queries:', error);
        res.status(500).send('An error occurred while executing the database queries.');
    }
});

app.get('/pokemon', async function (req, res) {
    try {

        const query = `SELECT pokemon.pokemon_id, 
                        pokemon.name 
                        FROM pokemon ORDER 
                        BY pokemon_id;`;
        const [pokemon] = await db.query(query);


        res.render('pokemon', { pokemon: pokemon });
    } catch (error) {
        console.error('Error executing query:', error);

        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

app.get('/types', async function (req, res) {
    try {

        const query = `SELECT types.types_id, 
                        types.name 
                        FROM types 
                        ORDER BY types_id;`;
        const [types] = await db.query(query);


        res.render('types', { types: types });
    } catch (error) {
        console.error('Error executing query:', error);

        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

app.get('/pokemon-typing', async function (req, res) {
    try {
        const query = `
            SELECT pokemon.pokemon_id, pokemon.name, types.name AS pokemon_type
            FROM pokemon
            LEFT JOIN pokemon_has_types ON pokemon.pokemon_id = pokemon_has_types.pokemon_id
            LEFT JOIN types ON pokemon_has_types.types_id = types.types_id
            ORDER BY pokemon.pokemon_id, types.name;
        `;
        const [rows] = await db.query(query);

        // Group types by pokemon_id
        const grouped = [];
        const map = new Map();
        for (const row of rows) {
            if (!map.has(row.pokemon_id)) {
                map.set(row.pokemon_id, {
                    pokemon_id: row.pokemon_id,
                    name: row.name,
                    types: []
                });
                grouped.push(map.get(row.pokemon_id));
            }
            if (row.pokemon_type) {
                map.get(row.pokemon_id).types.push(row.pokemon_type);
            }
        }

        res.render('pokemon-typing', { pokemon_typing: grouped });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send('An error occurred while executing the database query.');
    }
});

app.get('/abilities', async function (req, res) {
    try {

        const query = `SELECT abilities.abilities_id, 
                        abilities.name, 
                        abilities.description 
                        FROM abilities 
                        ORDER BY abilities_id;`;
        const [abilities] = await db.query(query);


        res.render('abilities', { abilities: abilities });
    } catch (error) {
        console.error('Error executing query:', error);

        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

app.get('/pokemon-abilities', async function (req, res) {
    try {
        const query = `
            SELECT pokemon.pokemon_id, 
                   pokemon.name, 
                   abilities.name AS ability_name
            FROM pokemon
            LEFT JOIN pokemon_has_abilities ON pokemon.pokemon_id = pokemon_has_abilities.pokemon_id
            LEFT JOIN abilities ON pokemon_has_abilities.abilities_id = abilities.abilities_id
            ORDER BY pokemon.pokemon_id, abilities.name;
        `;
        const [rows] = await db.query(query);

        // Group abilities by pokemon_id
        const grouped = [];
        const map = new Map();
        for (const row of rows) {
            if (!map.has(row.pokemon_id)) {
                map.set(row.pokemon_id, {
                    pokemon_id: row.pokemon_id,
                    name: row.name,
                    abilities: []
                });
                grouped.push(map.get(row.pokemon_id));
            }
            if (row.ability_name) {
                map.get(row.pokemon_id).abilities.push(row.ability_name);
            }
        }

        res.render('pokemon-abilities', { pokemon_abilities: grouped });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

app.get('/moves', async function (req, res) {
    try {

        const query = `SELECT moves.moves_id, 
                        moves.name, 
                        moves.power, 
                        moves.description,
                        types.name AS 'type_name' 
                        FROM moves
                        LEFT JOIN types ON moves.types_id = types.types_id
                        ORDER BY moves.moves_id;`;
        const [moves] = await db.query(query);

    
        res.render('moves', { moves: moves });
    } catch (error) {
        console.error('Error executing queries:', error);

        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.get('/pokemon-moves', async function (req, res) {
    try {

        const query = `SELECT pokemon.pokemon_id, pokemon.name, 
                        moves.name as "pokemon_move" FROM pokemon
                        LEFT JOIN pokemon_has_moves ON pokemon.pokemon_id = pokemon_has_moves.pokemon_id
                        LEFT JOIN moves ON pokemon_has_moves.moves_id = moves.moves_id
                        ORDER BY pokemon.pokemon_id;`;
        const [pokemon_moves] = await db.query(query);


        res.render('pokemon-moves', { pokemon_moves: pokemon_moves });
    } catch (error) {
        console.error('Error executing query:', error);
 
        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

app.get('/items', async function (req, res) {
    try {

        const query = `SELECT items.items_id, 
                        items.name, 
                        items.description 
                        FROM items 
                        ORDER BY items_id;`;
        const [items] = await db.query(query);


        res.render('items', { items: items });
    } catch (error) {
        console.error('Error executing query:', error);

        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

app.get('/natures', async function (req, res) {
    try {

        const query = `SELECT natures.natures_id, 
                        natures.name 
                        FROM natures 
                        ORDER BY natures_id;`;
        const [natures] = await db.query(query);


        res.render('natures', { natures: natures });
    } catch (error) {
        console.error('Error executing query:', error);

        res.status(500).send(
            'An error occurred while executing the database query.'
        );
    }
});

// get abilities for a specific customized pokemon
app.get('/api/customized-pokemon/:id/abilities', async function (req, res) {
    try {
        const customizedPokemonId = req.params.id;
        console.log('API called for customizedPokemonId:', customizedPokemonId);
        const [abilities] = await db.query('CALL getAbilitiesByPokemon(?, ?)', [customizedPokemonId, '']);
        console.log('SP result:', abilities);

        // If abilities[0] only has names, fetch IDs:
        const abilityNames = abilities[0].map(a => a['Ability Name']);
        const [ids] = await db.query(
            `SELECT abilities_id, name FROM abilities WHERE name IN (${abilityNames.map(() => '?').join(',')})`,
            abilityNames
        );
        const nameToId = {};
        ids.forEach(a => { nameToId[a.name] = a.abilities_id; });
        const abilitiesWithId = abilities[0].map(a => ({
            ...a,
            abilities_id: nameToId[a['Ability Name']]
        }));
        res.json(abilitiesWithId);
    } catch (error) {
        console.error('Error fetching abilities:', error);
        res.status(500).json({ error: 'Failed to fetch abilities.' });
    }
});

// get moves for a specific customized pokemon
app.get('/api/customized-pokemon/:id/moves', async function (req, res) {
    try {
        const customizedPokemonId = req.params.id;
        // Get the base pokemon_id for this customized_pokemon_id
        const [[{ pokemon_id } = {}]] = await db.query(
            'SELECT pokemon_id FROM customized_pokemon WHERE customized_pokemon_id = ?',
            [customizedPokemonId]
        );
        if (!pokemon_id) {
            return res.status(404).json({ error: 'Pokemon not found.' });
        }
        // Call your existing PL, which returns only move names
        const [moves] = await db.query('CALL getMovesByPokemon(?, ?)', [pokemon_id, '']);
        // Now, for each move, look up its ID (batch query for efficiency)
        const moveNames = moves[0].map(m => m['Move Name']);
        if (moveNames.length === 0) return res.json([]);
        const [moveIds] = await db.query(
            `SELECT moves_id, name FROM moves WHERE name IN (${moveNames.map(() => '?').join(',')})`,
            moveNames
        );
        // Map move name to ID
        const nameToId = {};
        moveIds.forEach(m => { nameToId[m.name] = m.moves_id; });
        // Attach moves_id to each move
        const movesWithId = moves[0].map(m => ({
            ...m,
            moves_id: nameToId[m['Move Name']]
        }));
        res.json(movesWithId);
    } catch (error) {
        console.error('Error fetching moves:', error);
        res.status(500).json({ error: 'Failed to fetch moves.' });
    }
});

// Citation for the following code:
// Date: 5/19/2025
// Copied/Adapted/Based on:
// Source URL: https://canvas.oregonstate.edu/courses/1999601/pages/exploration-implementing-cud-operations-in-your-app?module_item_id=25352968

// RESET ROUTE

app.post('/reset/database', async function (req, res) {
    try {
        await db.query('CALL resetPokemonDB()');

        console.log('Database has been reset.');
        res.redirect('/');

    } catch (error) {
        console.error('Error resetting database:', error);
        res.status(500).send(
            'An error occurred while resetting the database.'
        );
    }
});

// CREATE ROUTES

// creates a party
app.post('/parties/create', async function (req, res) {
    try {
        await db.query('CALL createParty()');
        console.log('Created a new party.');
        res.redirect('/parties');
    } catch (error) {
        console.error('Error creating party:', error);
        res.status(500).send('An error occurred while creating the party.');
    }
});

// creates a customized pokemon
app.post('/customized-pokemon/create', async function (req, res) {
    try {
        // Get partyId and pokemonId from the form submission
        const partyId = req.body.party_id;      // Adjust the name if your form uses a different field
        const pokemonId = req.body.create_pokemon;

        // Call the stored procedure
        await db.query('CALL addPokemonToParty(?, ?)', [partyId, pokemonId]);

        console.log(`Added Pokemon ID ${pokemonId} to Party ID ${partyId}`);
        res.redirect('/customized-pokemon');
    } catch (error) {
        console.error('Error adding Pokemon to party:', error);
        res.status(500).send('An error occurred while adding the Pokemon to the party.');
    }
});

// creates a move to a customized pokemon
app.post('/customized-pokemon-moves/add-move', async function (req, res) {
    try {
        const customizedPokemonId = req.body.customized_pokemon_id;
        const moveId = req.body.move_id;

        // Find the current party for this customized_pokemon_id
        const [[partyRow]] = await db.query(
            `SELECT parties_id FROM parties_has_customized_pokemon WHERE customized_pokemon_id = ? LIMIT 1`,
            [customizedPokemonId]
        );
        const partyId = partyRow ? partyRow.parties_id : null;

        if (!partyId) {
            res.status(400).send('This custom Pokémon is not assigned to any party.');
            return;
        }

        await db.query(
            'CALL addMoveToPokemon(?, ?, ?)',
            [partyId, customizedPokemonId, moveId]
        );

        res.redirect('/customized-pokemon-moves');
    } catch (error) {
        console.error('Error adding move:', error);
        res.status(500).send('An error occurred while adding the move.');
    }
});

// UPDATE ROUTES

// updates a pokemon's abilities, nature, and item
app.post('/customized-pokemon/update', async function (req, res) {
    try {
        const customizedPokemonId = req.body.update_pokemon;
        let abilityId = req.body.update_pokemon_ability;
        let natureId = req.body.update_pokemon_nature;
        let itemId = req.body.update_pokemon_item;

        // Convert empty strings or 'NULL' to null
        if (!abilityId || abilityId === 'NULL' || abilityId === 'undefined') {
            // Handle error or set to null if allowed
            return res.status(400).send('You must select a valid ability.');
        }
        if (!natureId || natureId === 'NULL') natureId = null;
        if (!itemId || itemId === 'NULL') itemId = null;

        // Find the current party for this customized_pokemon_id
        const [[partyRow]] = await db.query(
            `SELECT parties_id FROM parties_has_customized_pokemon WHERE customized_pokemon_id = ? LIMIT 1`,
            [customizedPokemonId]
        );
        const partyId = partyRow ? partyRow.parties_id : null;

        if (!partyId) {
            res.status(400).send('This custom Pokémon is not assigned to any party.');
            return;
        }

        await db.query(
            'CALL updatePokemon(?, ?, ?, ?, ?)',
            [partyId, customizedPokemonId, abilityId, natureId, itemId]
        );

        res.redirect('/customized-pokemon');
    } catch (error) {
        console.error('Error updating customized pokemon:', error);
        res.status(500).send('An error occurred while updating the customized pokemon.');
    }
});


// DELETE ROUTES

// deletes a party
app.post('/parties/delete', async function (req, res) {
    try {
        const partyId = req.body.parties_id;
        await db.query('CALL deleteParty(?)', [partyId]);

        console.log(`DELETE party. ID: ${partyId}`);

        res.redirect('/parties');

    } catch (error) {
        console.error('Error deleting party:', error);
        res.status(500).send(
            'An error occurred while deleting the party.'
        );
    }
});

// deletes a pokemon from customized party
app.post('/customized-parties/delete', async function (req, res) {
    try {
        const partyId = req.body.parties_id;
        const customizedPokemonId = req.body.customized_pokemon_id;

        // Debug log
        console.log(`Removing customized_pokemon_id ${customizedPokemonId} from party ${partyId}`);

        await db.query('CALL removePokemonFromParty(?, ?)', [partyId, customizedPokemonId]);

        res.redirect('/customized-parties');
    } catch (error) {
        console.error('Error removing customized pokemon from party:', error);
        res.status(500).send('An error occurred while removing the customized pokemon from the party.');
    }
});

// deletes a custom pokemon from customized pokemon
app.post('/customized-pokemon/delete', async function (req, res) {
    try {
        const customizedPokemonId = req.body.customized_pokemon_id;

        // Remove this Pokémon from all parties it's in
        await db.query(
            `DELETE FROM parties_has_customized_pokemon WHERE customized_pokemon_id = ?`,
            [customizedPokemonId]
        );

        // Clean up any unused customized_pokemon (calls your PL)
        await db.query('CALL cleanUnusedCustomizedPokemon()');

        res.redirect('/customized-pokemon');
    } catch (error) {
        console.error('Error deleting customized pokemon:', error);
        res.status(500).send('An error occurred while deleting the customized pokemon.');
    }
});

// deletes a move from a custom pokemon
app.post('/customized-pokemon-moves/remove-move', async function (req, res) {
    try {
        const customizedPokemonId = req.body.customized_pokemon_id;
        const moveId = req.body.move_id;

        // Find the current party for this customized_pokemon_id
        const [[partyRow]] = await db.query(
            `SELECT parties_id FROM parties_has_customized_pokemon WHERE customized_pokemon_id = ? LIMIT 1`,
            [customizedPokemonId]
        );
        const partyId = partyRow ? partyRow.parties_id : null;

        if (!partyId) {
            res.status(400).send('This custom Pokémon is not assigned to any party.');
            return;
        }

        await db.query(
            'CALL removeMoveFromPokemon(?, ?, ?)',
            [partyId, customizedPokemonId, moveId]
        );

        res.redirect('/customized-pokemon-moves');
    } catch (error) {
        console.error('Error removing move:', error);
        res.status(500).send('An error occurred while removing the move.');
    }
});

// ########################################
// ########## LISTENER

app.listen(PORT, function () {
    console.log(
        'Express started on http://localhost:' +
            PORT +
            '; press Ctrl-C to terminate.'
    );
});
