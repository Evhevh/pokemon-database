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
const { engine } = require('express-handlebars'); // Import express-handlebars engine
app.engine('.hbs', engine({ extname: '.hbs' })); // Create instance of handlebars
app.set('view engine', '.hbs'); // Use handlebars engine for *.hbs files.

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
        const [customized_parties] = await db.query(query);
        const [customized_pokemon] = await db.query(query2);


        res.render('customized-parties', { customized_parties: customized_parties, customized_pokemon: customized_pokemon });
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
        const query2 ='SELECT * FROM pokemon;';
        const query3 ='SELECT * FROM abilities;';
        const query4 ='SELECT * FROM natures;';
        const query5 ='SELECT * FROM items;';
        const query6 = `SELECT customized_pokemon_id, 
                        pokemon.name AS 'pokemon_name'
                        FROM customized_pokemon
                        LEFT JOIN pokemon ON customized_pokemon.pokemon_id = pokemon.pokemon_id
                        ORDER BY customized_pokemon.customized_pokemon_id`;
        const [customized_pokemon] = await db.query(query);
        const [pokemon] = await db.query(query2)
        const [ability] = await db.query(query3)
        const [nature] = await db.query(query4)
        const [item] = await db.query(query5)
        const [update_pokemon] = await db.query(query6)

        res.render('customized-pokemon', { customized_pokemon: customized_pokemon, pokemon: pokemon, ability: ability, nature: nature, item:item, update_pokemon: update_pokemon });
    } catch (error) {
        console.error('Error executing queries:', error);

        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
    }
});

app.get('/customized-pokemon-moves', async function (req, res) {
    try {
        const query = `SELECT customized_pokemon.customized_pokemon_id,
                        pokemon.name AS 'pokemon_name',
                        moves.name AS 'move_name'
                        FROM customized_pokemon
                        LEFT JOIN pokemon ON customized_pokemon.pokemon_id = pokemon.pokemon_id
                        LEFT JOIN customized_pokemon_has_moves ON customized_pokemon.customized_pokemon_id = customized_pokemon_has_moves.customized_pokemon_id
                        LEFT JOIN moves on customized_pokemon_has_moves.moves_id = moves.moves_id
                        ORDER BY customized_pokemon.customized_pokemon_id`;
        const [customized_pokemon_moves] = await db.query(query);

        res.render('customized-pokemon-moves', { customized_pokemon_moves: customized_pokemon_moves });
    } catch (error) {
        console.error('Error executing queries:', error);

        res.status(500).send(
            'An error occurred while executing the database queries.'
        );
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

        const query = `SELECT pokemon.pokemon_id, pokemon.name, 
                        types.name as "pokemon_type" FROM pokemon
                        LEFT JOIN pokemon_has_types ON pokemon.pokemon_id = pokemon_has_types.pokemon_id
                        LEFT JOIN types ON pokemon_has_types.types_id = types.types_id
                        ORDER BY pokemon.pokemon_id;`;
        const [pokemon_typing] = await db.query(query);


        res.render('pokemon-typing', { pokemon_typing: pokemon_typing });
    } catch (error) {
        console.error('Error executing query:', error);

        res.status(500).send(
            'An error occurred while executing the database query.'
        );
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

        const query = `SELECT pokemon.pokemon_id, 
                        pokemon.name, 
                        abilities.name as "pokemon_ability" 
                        FROM pokemon
                        LEFT JOIN pokemon_has_abilities ON pokemon.pokemon_id = pokemon_has_abilities.pokemon_id
                        LEFT JOIN abilities ON pokemon_has_abilities.abilities_id = abilities.abilities_id
                        ORDER BY pokemon.pokemon_id;`;
        const [pokemon_abilities] = await db.query(query);


        res.render('pokemon-abilities', { pokemon_abilities: pokemon_abilities });
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


// DELETE ROUTES
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

// ########################################
// ########## LISTENER

app.listen(PORT, function () {
    console.log(
        'Express started on http://localhost:' +
            PORT +
            '; press Ctrl-C to terminate.'
    );
});